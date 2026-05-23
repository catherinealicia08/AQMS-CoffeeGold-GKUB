'use client';

import { useEffect, useRef } from 'react';
import { db } from '@aqms/shared';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { QUEUE_STATUS } from '@aqms/shared';
import { useToast } from '@/context/ToastContext';

export function useOrderNotifier(userId: string | null) {
  const { showToast } = useToast();
  const notifiedRef = useRef<Set<string>>(new Set());

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
          }
        }
      });
    });

    return unsub;
  }, [userId, showToast]);
}
