'use client';

import { useEffect } from 'react';
import { app, db } from '@aqms/shared';
import { getMessaging, getToken } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';

export function useFCMToken(userId: string | null) {
  useEffect(() => {
    if (!userId || typeof window === 'undefined') return;
    if (!('Notification' in window)) return;

    async function register() {
      try {
        // Request permission if not yet decided
        let permission = Notification.permission;
        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }
        if (permission !== 'granted') return;

        const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const messaging = getMessaging(app);
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: swReg,
        });

        if (token && userId) {
          await setDoc(doc(db, 'users', userId), { fcmToken: token }, { merge: true });
        }
      } catch (err) {
        console.warn('FCM token error:', err);
      }
    }

    register();
  }, [userId]);
}
