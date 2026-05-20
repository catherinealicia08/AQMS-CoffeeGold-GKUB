'use client';

import { useEffect, useState } from 'react';
import { db } from '@aqms/shared';
import { doc, onSnapshot } from 'firebase/firestore';

export interface Order {
  id: string;
  status: string;
  queue_number?: number;
  items: { name: string; qty: number; price: number; customizations: string[] }[];
  total: number;
  created_at?: { toDate: () => Date } | null;
  completed_at?: { toDate: () => Date } | null;
}

export function useOrder(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, 'orders', orderId), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() } as Order);
      }
      setLoading(false);
    });

    return unsub;
  }, [orderId]);

  return { order, loading };
}
