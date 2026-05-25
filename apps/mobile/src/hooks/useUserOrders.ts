'use client';

import { useEffect, useState } from 'react';
import { db } from '@aqms/shared';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import type { Order } from './useOrder';

export function useUserOrders(uid: string | null) {
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setCompletedOrders([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('user_id', '==', uid),
      where('status', '==', 'completed'),
      orderBy('completed_at', 'desc'),
    );

    const unsub = onSnapshot(q, (snap) => {
      setCompletedOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order));
      setLoading(false);
    });

    return unsub;
  }, [uid]);

  return { completedOrders, loading };
}
