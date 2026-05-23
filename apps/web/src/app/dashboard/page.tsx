'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { auth } from '@aqms/shared';
import { signOut } from 'firebase/auth';
import { QUEUE_STATUS } from '@aqms/shared';
import Sidebar from '@/components/barista/Sidebar';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { formatRupiah, formatTime } from '@/lib/format';

type OrderTab = 'SEMUA' | 'AKTIF' | 'SELESAI';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const stats = useDashboardStats();
  const [orderTab, setOrderTab] = useState<OrderTab>('SEMUA');

  useEffect(() => {
    if (!loading && !user) router.replace('/barista/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-gold/50 text-sm">
        Memuat...
      </div>
    );
  }

  const maxHourly = Math.max(...stats.hourlyOrders.map((h) => h.count), 1);

  const filteredOrders = stats.allOrders.filter((o) => {
    if (orderTab === 'AKTIF') return o.status === QUEUE_STATUS.QUEUED || o.status === QUEUE_STATUS.IN_PROGRESS;
    if (orderTab === 'SELESAI') return o.status === QUEUE_STATUS.COMPLETED;
    return true;
  });

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      <Sidebar
        activeTab="DASHBOARD"
        onTabChange={(t) => {
          if (t === 'INCOMING' || t === 'COMPLETED') router.push('/barista');
        }}
        user={user}
        onLogout={async () => { await signOut(auth); router.replace('/barista/login'); }}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <h1 className="text-base md:text-lg font-black text-gray-900">Dashboard</h1>
          </div>
          <span className="text-xs text-gray-400">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <StatCard
              label="Order Hari Ini"
              value={stats.loading ? '—' : String(stats.totalOrdersToday)}
              sub="total masuk"
              color="gold"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              }
            />
            <StatCard
              label="Selesai Hari Ini"
              value={stats.loading ? '—' : String(stats.completedToday)}
              sub="pesanan completed"
              color="green"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
            />
            <StatCard
              label="Antrian Aktif"
              value={stats.loading ? '—' : String(stats.pendingNow)}
              sub="sedang diproses"
              color="amber"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
            />
            <StatCard
              label="Revenue Hari Ini"
              value={stats.loading ? '—' : formatRupiah(stats.revenueToday)}
              sub={`total: ${stats.loading ? '—' : formatRupiah(stats.revenueTotal)}`}
              color="gold"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              }
            />
          </div>

          {/* Chart + Top Items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {/* Hourly bar chart */}
            <div className="md:col-span-2 bg-white rounded-2xl p-4 md:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black text-gray-900">Order per Jam (Hari Ini)</h2>
                <span className="text-xs text-gray-400">{stats.totalOrdersToday} total</span>
              </div>
              {stats.loading ? (
                <div className="h-32 flex items-center justify-center text-gray-300 text-xs">Memuat...</div>
              ) : stats.totalOrdersToday === 0 ? (
                <div className="h-32 flex items-center justify-center text-gray-300 text-xs">Belum ada order hari ini</div>
              ) : (
                <div className="flex items-end gap-1 h-32 overflow-x-auto pb-1">
                  {stats.hourlyOrders.map((h) => {
                    const heightPct = (h.count / maxHourly) * 100;
                    const isActive = h.count > 0;
                    return (
                      <div key={h.hour} className="flex flex-col items-center gap-1 flex-1 min-w-[20px] group relative">
                        <div
                          className={`w-full rounded-t-md transition-all ${isActive ? 'bg-gold' : 'bg-gray-100'}`}
                          style={{ height: `${Math.max(heightPct, isActive ? 8 : 3)}%` }}
                        />
                        {isActive && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-gray-800 text-white text-[9px] rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                            {h.hour} · {h.count}
                          </div>
                        )}
                        {(parseInt(h.hour) % 4 === 0) && (
                          <span className="text-[8px] text-gray-400 shrink-0">{h.hour.slice(0, 2)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Items */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm">
              <h2 className="text-sm font-black text-gray-900 mb-4">Top Menu</h2>
              {stats.loading ? (
                <div className="text-xs text-gray-300">Memuat...</div>
              ) : stats.topItems.length === 0 ? (
                <div className="text-xs text-gray-300">Belum ada data</div>
              ) : (
                <div className="space-y-3">
                  {stats.topItems.map((item, i) => {
                    const maxQty = stats.topItems[0].qty;
                    const pct = (item.qty / maxQty) * 100;
                    return (
                      <div key={item.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-gray-400 w-3">{i + 1}</span>
                            <span className="text-xs font-semibold text-gray-800 truncate max-w-[110px]">{item.name}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 shrink-0">{item.qty}x</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gold rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Orders table */}
          <div className="bg-white rounded-2xl shadow-sm flex flex-col" style={{ maxHeight: 360 }}>
            {/* Table header */}
            <div className="flex items-center justify-between px-4 md:px-5 pt-4 md:pt-5 pb-3 shrink-0">
              <h2 className="text-sm font-black text-gray-900">Semua Pesanan</h2>
              <div className="flex items-center gap-1 bg-cream rounded-xl p-1">
                {(['SEMUA', 'AKTIF', 'SELESAI'] as OrderTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setOrderTab(tab)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-colors ${
                      orderTab === tab
                        ? 'bg-white text-gold shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto overflow-x-auto flex-1 px-4 md:px-5 pb-4">
              {stats.loading ? (
                <div className="text-xs text-gray-300 py-4">Memuat...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-xs text-gray-300 py-4">Tidak ada pesanan</div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-white">
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                      <th className="pb-2 font-semibold pr-3">#</th>
                      <th className="pb-2 font-semibold pr-3">Nama</th>
                      <th className="pb-2 font-semibold pr-3">Item</th>
                      <th className="pb-2 font-semibold pr-3">Total</th>
                      <th className="pb-2 font-semibold pr-3">Status</th>
                      <th className="pb-2 font-semibold">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredOrders.map((order) => {
                      const createdAt = order.created_at?.toDate();
                      const isCompleted = order.status === QUEUE_STATUS.COMPLETED;
                      const isActive = order.status === QUEUE_STATUS.IN_PROGRESS;
                      return (
                        <tr key={order.id} className="hover:bg-cream/50 transition-colors">
                          <td className="py-2.5 pr-3 font-black text-gray-900">
                            #{order.queue_number ?? order.id.substring(0, 4).toUpperCase()}
                          </td>
                          <td className="py-2.5 pr-3 font-medium text-gray-700 whitespace-nowrap">{order.user_name}</td>
                          <td className="py-2.5 pr-3 text-gray-500 max-w-[200px] truncate">
                            {order.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                          </td>
                          <td className="py-2.5 pr-3 font-semibold text-gold whitespace-nowrap">{formatRupiah(order.total)}</td>
                          <td className="py-2.5 pr-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              isCompleted
                                ? 'bg-green-50 text-green-700'
                                : isActive
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-gold/10 text-gold'
                            }`}>
                              {isCompleted ? 'Selesai' : isActive ? 'Proses' : 'Antrian'}
                            </span>
                          </td>
                          <td className="py-2.5 text-gray-400 whitespace-nowrap">
                            {createdAt ? formatTime(createdAt) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-4 md:px-6 py-2 bg-gold/90 text-white text-xs">
          <span className="text-white/70">Dashboard · Live data</span>
          <span className="font-semibold">{formatTime(new Date())}</span>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  color: 'gold' | 'green' | 'amber';
  icon: React.ReactNode;
}

function StatCard({ label, value, sub, color, icon }: StatCardProps) {
  const colorMap = {
    gold: { bg: 'bg-gold/10', text: 'text-gold', icon: 'text-gold' },
    green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-600' },
  };
  const c = colorMap[color];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-2">
      <div className={`w-8 h-8 rounded-xl ${c.bg} ${c.icon} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className={`text-lg md:text-xl font-black leading-tight ${c.text}`}>{value}</p>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-0.5">{label}</p>
        <p className="text-[10px] text-gray-400">{sub}</p>
      </div>
    </div>
  );
}
