'use client';

import { useEffect } from 'react';
import { app, db } from '@aqms/shared';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';

type RegisterFCMTokenResult =
  | 'saved'
  | 'default'
  | 'denied'
  | 'unsupported'
  | 'missing-vapid'
  | 'no-token';

export async function registerFCMToken(
  userId: string,
  options: { requestPermission?: boolean } = {}
): Promise<RegisterFCMTokenResult> {
  if (typeof window === 'undefined') return 'unsupported';
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported';
  if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) return 'missing-vapid';

  const supported = await isSupported();
  if (!supported) return 'unsupported';

  let permission = Notification.permission;
  if (permission === 'default' && options.requestPermission) {
    permission = await Notification.requestPermission();
  }
  if (permission === 'default') return 'default';
  if (permission !== 'granted') return 'denied';

  const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: swReg,
  });

  if (!token) return 'no-token';

  await setDoc(doc(db, 'fcm_tokens', userId), { token, role: 'customer' }, { merge: true });
  return 'saved';
}

export function useFCMToken(userId: string | null) {
  useEffect(() => {
    if (!userId || typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    const uid = userId;

    async function register() {
      try {
        await registerFCMToken(uid);
      } catch (err) {
        console.warn('FCM token error:', err);
      }
    }

    register();
  }, [userId]);
}
