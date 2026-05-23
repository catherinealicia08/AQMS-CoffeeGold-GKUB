'use client';

import { useEffect, useState } from 'react';
import { db } from '@aqms/shared';
import { QUEUE_STATUS } from '@aqms/shared';
import { collection, onSnapshot, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { Order } from '@/types/order';

export interface DashboardStats {
  totalOrdersToday: number;
  completedToday: number;
  pendingNow: number;
  revenueToday: number;
  revenueTotal: number;
  topItems: { name: string; qty: number; revenue: number }[];
  recentCompleted: Order[];
  hourlyOrders: { hour: string; count: number }[];
  allOrders: Order[];
  loading: boolean;
}

function startOfToday(): Timestamp {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return Timestamp.fromDate(d);
}

export function useDashboardStats(): DashboardStats {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setAllOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const todayStart = startOfToday();

  const todayOrders = allOrders.filter((o) => {
    if (!o.created_at) return false;
    const ts = o.created_at as unknown as Timestamp;
    return ts.seconds >= todayStart.seconds;
  });

  const completedToday = todayOrders.filter((o) => o.status === QUEUE_STATUS.COMPLETED);
  const pendingNow = allOrders.filter(
    (o) => o.status === QUEUE_STATUS.QUEUED || o.status === QUEUE_STATUS.IN_PROGRESS
  );

  const revenueToday = completedToday.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const revenueTotal = allOrders
    .filter((o) => o.status === QUEUE_STATUS.COMPLETED)
    .reduce((sum, o) => sum + (o.total ?? 0), 0);

  // Top items from all completed orders
  const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  allOrders
    .filter((o) => o.status === QUEUE_STATUS.COMPLETED)
    .forEach((o) => {
      o.items.forEach((item) => {
        if (!itemMap[item.name]) itemMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
        itemMap[item.name].qty += item.qty;
        itemMap[item.name].revenue += item.price * item.qty;
      });
    });
  const topItems = Object.values(itemMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Hourly orders today (0–23)
  const hourlyMap: Record<number, number> = {};
  todayOrders.forEach((o) => {
    if (!o.created_at) return;
    const ts = o.created_at as unknown as Timestamp;
    const h = new Date(ts.seconds * 1000).getHours();
    hourlyMap[h] = (hourlyMap[h] ?? 0) + 1;
  });
  const hourlyOrders = Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, '0')}:00`,
    count: hourlyMap[h] ?? 0,
  }));

  const recentCompleted = allOrders
    .filter((o) => o.status === QUEUE_STATUS.COMPLETED)
    .slice(0, 5);

  return {
    totalOrdersToday: todayOrders.length,
    completedToday: completedToday.length,
    pendingNow: pendingNow.length,
    revenueToday,
    revenueTotal,
    topItems,
    recentCompleted,
    hourlyOrders,
    allOrders,
    loading,
  };
}
