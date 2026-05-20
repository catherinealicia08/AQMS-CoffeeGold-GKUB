'use client';

import { useEffect, useState } from 'react';
import { db } from '@aqms/shared';
import { QUEUE_STATUS } from '@aqms/shared';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import type { Order } from '@/types/order';

export function useActiveOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('status', 'in', [QUEUE_STATUS.QUEUED, QUEUE_STATUS.IN_PROGRESS]),
      orderBy('created_at', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    });

    return unsub;
  }, []);

  return { orders, loading };
}

export function useCompletedOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('status', '==', QUEUE_STATUS.COMPLETED),
      orderBy('created_at', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    });

    return unsub;
  }, []);

  return { orders, loading };
}
