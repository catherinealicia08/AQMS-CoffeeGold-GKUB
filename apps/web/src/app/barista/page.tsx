'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { auth } from '@aqms/shared';
import { signOut } from 'firebase/auth';
import Sidebar from '@/components/barista/Sidebar';
import TopBar from '@/components/barista/TopBar';
import OrderCard from '@/components/barista/OrderCard';
import { useActiveOrders, useCompletedOrders } from '@/hooks/useOrders';
import { usePushNotification } from '@/hooks/usePushNotification';
import { formatTime } from '@/lib/format';
import { QUEUE_STATUS } from '@aqms/shared';

export default function BaristaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'INCOMING' | 'COMPLETED'>('INCOMING');
  const [search, setSearch] = useState('');
  const [lastSync, setLastSync] = useState(new Date());

  usePushNotification(user?.uid);

  const { orders: activeOrders } = useActiveOrders();
  const { orders: completedOrders } = useCompletedOrders();

  useEffect(() => {
    const id = setInterval(() => setLastSync(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

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

  const isSearching = search.trim().length > 0;
  const allOrders = [...activeOrders, ...completedOrders];
  const rawOrders = activeTab === 'INCOMING' ? activeOrders : completedOrders;
  const orders = isSearching
    ? allOrders.filter((o) => {
        const q = search.replace(/^#/, '').toLowerCase();
        const displayNumber = String(o.queue_number ?? o.id.substring(0, 4)).toLowerCase();
        return (
          o.user_name?.toLowerCase().includes(q) ||
          displayNumber.includes(q)
        );
      })
    : rawOrders;

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t as 'INCOMING' | 'COMPLETED')}
        user={user}
        onLogout={async () => { await signOut(auth); router.replace('/barista/login'); }}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          activeTab={activeTab}
          activeCount={activeOrders.length}
          completedCount={completedOrders.length}
          search={search}
          onSearchChange={setSearch}
          searchCount={orders.length}
        />

        {/* Queue scroll area */}
        <div className="flex-1 p-4 md:p-6 overflow-x-auto overflow-y-auto md:overflow-y-hidden">
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
            <div className="flex flex-wrap md:flex-nowrap gap-4 items-start">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isCompleted={isSearching ? order.status === QUEUE_STATUS.COMPLETED : activeTab === 'COMPLETED'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom status bar */}
        <div className="flex items-center justify-between px-4 md:px-6 py-2 bg-gold/90 text-white text-xs">
          <span className="text-white/70">Last sync · {formatTime(lastSync)}</span>
          <span className="font-semibold">{formatTime(new Date())}</span>
        </div>
      </div>
    </div>
  );
}
