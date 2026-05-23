'use client';

import { useEffect } from 'react';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app, db } from '@aqms/shared';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export function usePushNotification(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function register() {
      const supported = await isSupported();
      if (!supported || cancelled) return;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted' || cancelled) return;

      const sw = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      if (cancelled) return;

      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: sw,
      });

      if (!token || cancelled) return;

      await setDoc(
        doc(db, 'fcm_tokens', userId),
        { token, updated_at: serverTimestamp() },
        { merge: true }
      );
    }

    register().catch((err) => console.error('[push] register failed', err));

    return () => { cancelled = true; };
  }, [userId]);
}
