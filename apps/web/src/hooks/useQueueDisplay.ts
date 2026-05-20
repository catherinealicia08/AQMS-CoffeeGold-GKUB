'use client';

import { useEffect, useState } from 'react';
import { db } from '@aqms/shared';
import { QUEUE_STATUS } from '@aqms/shared';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';

export interface QueueEntry {
  id: string;
  queue_number: number;
  status: string;
}

export function useQueueDisplay() {
  const [preparing, setPreparing] = useState<QueueEntry[]>([]);
  const [ready, setReady] = useState<QueueEntry[]>([]);

  useEffect(() => {
    const preparingQ = query(
      collection(db, 'orders'),
      where('status', 'in', [QUEUE_STATUS.QUEUED, QUEUE_STATUS.IN_PROGRESS]),
      orderBy('queue_number', 'asc'),
      limit(9)
    );

    const readyQ = query(
      collection(db, 'orders'),
      where('status', '==', QUEUE_STATUS.COMPLETED),
      orderBy('completed_at', 'desc'),
      limit(5)
    );

    const unsubPreparing = onSnapshot(preparingQ, (snap) => {
      setPreparing(snap.docs.map((d) => ({ id: d.id, ...d.data() } as QueueEntry)));
    });

    const unsubReady = onSnapshot(readyQ, (snap) => {
      setReady(snap.docs.map((d) => ({ id: d.id, ...d.data() } as QueueEntry)));
    });

    return () => {
      unsubPreparing();
      unsubReady();
    };
  }, []);

  return { preparing, ready };
}
