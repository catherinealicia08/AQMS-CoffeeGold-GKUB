'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/barista/Sidebar';
import TopBar from '@/components/barista/TopBar';
import OrderCard from '@/components/barista/OrderCard';
import { useActiveOrders, useCompletedOrders } from '@/hooks/useOrders';
import { formatTime } from '@/lib/format';

export default function BaristaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'INCOMING' | 'COMPLETED'>('INCOMING');

  const { orders: activeOrders } = useActiveOrders();
  const { orders: completedOrders } = useCompletedOrders();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/barista/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-gold/50 text-sm">
        Memuat...
      </div>
    );
  }

  const orders = activeTab === 'INCOMING' ? activeOrders : completedOrders;

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={(t) => setActiveTab(t as 'INCOMING' | 'COMPLETED')} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          activeTab={activeTab}
          activeCount={activeOrders.length}
          completedCount={completedOrders.length}
        />

        {/* Queue scroll area */}
        <div className="flex-1 p-6 overflow-x-auto overflow-y-hidden">
          {orders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-cream-dark flex items-center justify-center mb-4">
                {activeTab === 'INCOMING' ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="1.5">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <p className="font-semibold text-gray-600 mb-1">
                {activeTab === 'INCOMING' ? 'Antrian kosong' : 'Belum ada pesanan selesai'}
              </p>
              <p className="text-sm text-gray-400">
                {activeTab === 'INCOMING'
                  ? 'Pesanan baru akan muncul di sini secara real-time.'
                  : 'Pesanan yang sudah selesai akan tampil di sini.'}
              </p>
            </div>
          ) : (
            <div className="flex gap-4 h-full">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isCompleted={activeTab === 'COMPLETED'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom status bar */}
        <div className="flex items-center justify-between px-6 py-2 bg-gold/90 text-white text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="font-semibold">{user.displayName ?? user.email}</span>
          </div>
          <div className="flex items-center gap-4 text-white/70">
            <span>ACTIVITY NOW AGO</span>
            <span>LAST TASK · LAST NOW</span>
            <span>© COFFEE GOLD GKUB</span>
          </div>
          <div className="text-white/70">
            Last activity · {formatTime(new Date())}
          </div>
        </div>
      </div>
    </div>
  );
}
