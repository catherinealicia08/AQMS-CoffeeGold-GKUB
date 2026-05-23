'use client';

import { useEffect } from 'react';
import { db } from '@aqms/shared';
import { doc, setDoc } from 'firebase/firestore';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

/** Ubah base64url VAPID public key ke Uint8Array yang dibutuhkan browser */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

/**
 * Daftarkan browser ini ke Web Push dan simpan subscription ke Firestore.
 * Dipanggil setelah user memberi izin notifikasi.
 */
export async function registerWebPush(userId: string): Promise<'saved' | 'denied' | 'unsupported' | 'missing-vapid' | 'error'> {
  if (typeof window === 'undefined') return 'unsupported';
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported';
  if (!VAPID_PUBLIC_KEY) return 'missing-vapid';

  // Minta izin notifikasi
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';

  try {
    // Register service worker push-sw.js
    const swReg = await navigator.serviceWorker.register('/push-sw.js', {
      scope: '/',
    });

    // Tunggu SW aktif
    await navigator.serviceWorker.ready;

    // Subscribe ke Web Push dengan VAPID public key
    const subscription = await swReg.pushManager.subscribe({
      userVisibleOnly: true, // wajib true di semua browser termasuk iOS
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Simpan subscription ke Firestore: users/{uid}/pushSubscription
    await setDoc(
      doc(db, 'users', userId),
      {
        pushSubscription: JSON.parse(JSON.stringify(subscription)),
        pushUpdatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return 'saved';
  } catch (err) {
    console.error('[WebPush] Subscription error:', err);
    return 'error';
  }
}

/**
 * Hook yang dipanggil saat user login.
 * Kalau permission sudah granted sebelumnya → langsung re-subscribe (refresh token).
 * Kalau belum → tidak minta permission otomatis (tunggu user klik tombol di UI).
 */
export function useWebPush(userId: string | null) {
  useEffect(() => {
    if (!userId || typeof window === 'undefined') return;
    if (!('PushManager' in window)) return;
    // Hanya auto-subscribe kalau permission sudah pernah granted
    if (Notification.permission !== 'granted') return;

    registerWebPush(userId).catch((e) =>
      console.warn('[WebPush] Auto-register error:', e)
    );
  }, [userId]);
}
