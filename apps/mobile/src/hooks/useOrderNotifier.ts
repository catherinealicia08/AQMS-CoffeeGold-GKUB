'use client';

import { useEffect, useRef } from 'react';
import { db } from '@aqms/shared';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { QUEUE_STATUS } from '@aqms/shared';
import { useToast } from '@/context/ToastContext';

function sendNativeNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icons/icon-192.png' });
  }
}

async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

export function useOrderNotifier(userId: string | null) {
  const { showToast } = useToast();
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'orders'),
      where('user_id', '==', userId),
      where('status', '==', QUEUE_STATUS.COMPLETED)
    );

    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const id = change.doc.id;
          if (!notifiedRef.current.has(id)) {
            notifiedRef.current.add(id);
            showToast('Pesanan kamu siap diambil!', 'success');
            sendNativeNotification('Coffee Gold', 'Pesanan kamu siap diambil!');
          }
        }
      });
    });

    return unsub;
  }, [userId, showToast]);
}
