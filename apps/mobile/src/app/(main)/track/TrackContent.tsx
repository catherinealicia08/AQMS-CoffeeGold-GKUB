'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOrder } from '@/hooks/useOrder';
import type { Order } from '@/hooks/useOrder';
import { useUserOrders } from '@/hooks/useUserOrders';
import { useAuth } from '@/context/AuthContext';
import { QUEUE_STATUS } from '@aqms/shared';
import { formatRupiah } from '@/lib/format';
import Link from 'next/link';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTIVE_KEY  = 'aqms_active_order_ids';
const HISTORY_KEY = 'aqms_history_order_ids';
const ESTIMATE_MS = 3 * 60 * 1000; // 3 menit estimasi

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadIds(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(key) ?? '[]'); }
  catch { return []; }
}

function saveIds(key: string, ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(ids));
}

// ─── Live countdown hook ──────────────────────────────────────────────────────

function useEstimatedCountdown(createdAt: Order['created_at']) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!createdAt) return;
    const expiry = createdAt.toDate().getTime() + ESTIMATE_MS;
    function tick() { setRemainingMs(Math.max(0, expiry - Date.now())); }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);

  return remainingMs;
}

function formatMs(ms: number) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Full Active Order Card ───────────────────────────────────────────────────
// Setiap order aktif tampil sebagai card penuh dengan countdown + detail

function ActiveOrderCard({
  orderId,
  index,
  onMoveToHistory,
}: {
  orderId: string;
  index: number;
  onMoveToHistory: (id: string) => void;
}) {
  const { order, loading } = useOrder(orderId);
  const countdown = useEstimatedCountdown(order?.created_at ?? null);
  const [justCompleted, setJustCompleted] = useState(false);

  // Saat status jadi completed → flash sebentar → pindah ke history
  useEffect(() => {
    if (order?.status === QUEUE_STATUS.COMPLETED) {
      setJustCompleted(true);
      const t = setTimeout(() => onMoveToHistory(orderId), 1800);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-5 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
        <div className="h-20 bg-gray-100 rounded-2xl mb-3" />
        <div className="h-10 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!order) return null;

  // ── Completed flash state ──
  if (justCompleted) {
    return (
      <div className="bg-green-500 rounded-3xl p-6 flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p className="text-xl font-black text-white">Pesanan #{order.queue_number} Siap! ☕</p>
        <p className="text-sm text-white/80">Silakan ambil di counter</p>
        <p className="text-xs text-white/60">Memindahkan ke riwayat...</p>
      </div>
    );
  }

  const isOverdue = countdown !== null && countdown === 0;
  const progressPct = countdown !== null
    ? Math.min(100, ((ESTIMATE_MS - countdown) / ESTIMATE_MS) * 100)
    : 0;

  // Warna aksen berbeda untuk tiap card (kalau ada lebih dari 1)
  const accentColors = ['bg-gold', 'bg-amber-700', 'bg-stone-600'];
  const accentClass = accentColors[index % accentColors.length];

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">

      {/* ── Header: nomor antrian + status ── */}
      <div className={`${accentClass} px-5 pt-5 pb-14 relative`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">
              Nomor Antrian
            </p>
            <p className="text-7xl font-black text-white leading-none">
              {order.queue_number ?? '—'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Sedang Diproses
            </span>
            <p className="text-white/60 text-xs font-medium">
              {order.user_name}
            </p>
          </div>
        </div>
      </div>

      {/* ── Countdown card (overlap header) ── */}
      <div className="px-4 -mt-10 mb-1 relative z-10">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Estimasi Waktu Tunggu
              </p>
              {isOverdue ? (
                <p className="text-xl font-black text-amber-600">Menunggu barista...</p>
              ) : countdown !== null ? (
                <p className="text-4xl font-black text-gray-900 tabular-nums">
                  {formatMs(countdown)}
                </p>
              ) : (
                <p className="text-4xl font-black text-gray-300 tabular-nums">—:——</p>
              )}
            </div>
            {/* Circular progress indicator */}
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#F3F0EB" strokeWidth="4" />
                <circle
                  cx="28" cy="28" r="24"
                  fill="none"
                  stroke={isOverdue ? '#D97706' : '#C19A38'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - progressPct / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {isOverdue ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C19A38" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {!isOverdue && (
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-gold h-1.5 rounded-full"
                style={{
                  width: `${progressPct}%`,
                  transition: 'width 1s linear',
                }}
              />
            </div>
          )}

          {isOverdue && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-xs text-amber-600 font-medium">
                Melebihi estimasi — barista segera menyelesaikan
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail pesanan ── */}
      <div className="px-4 pb-5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
          Detail Pesanan
        </p>
        <div className="flex flex-col gap-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-cream-dark rounded-xl px-4 py-2.5">
              <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-black text-gold">{item.qty}×</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                {item.customizations.length > 0 && (
                  <p className="text-[10px] text-gray-400 truncate">
                    {item.customizations.join(' · ')}
                  </p>
                )}
              </div>
              <p className="text-sm font-bold text-gray-700 shrink-0">
                {formatRupiah(item.price * item.qty)}
              </p>
            </div>
          ))}

          {/* Total */}
          <div className="flex justify-between items-center px-1 pt-1">
            <span className="text-sm font-bold text-gray-800">Total Pembayaran</span>
            <span className="text-base font-black text-gold">{formatRupiah(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── History Card ─────────────────────────────────────────────────────────────

function HistoryCard({ orderId }: { orderId: string }) {
  const { order, loading } = useOrder(orderId);
  const [expanded, setExpanded] = useState(false);

  if (loading) return <div className="bg-white rounded-2xl h-20 animate-pulse" />;
  if (!order) return null;

  const completedAt = order.completed_at?.toDate();

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      {/* Summary row */}
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
          <span className="text-xl font-black text-green-600">#{order.queue_number ?? '?'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">
            {order.items.map(i => i.name).join(', ')}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {completedAt
              ? completedAt.toLocaleString('id-ID', {
                  hour: '2-digit', minute: '2-digit',
                  day: 'numeric', month: 'short',
                })
              : '—'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <p className="text-sm font-bold text-gold">{formatRupiah(order.total)}</p>
          <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
            Selesai ✓
          </span>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#9CA3AF" strokeWidth="2.5"
          className={`shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-4 border-t border-gray-50">
          <div className="flex flex-col gap-2 pt-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-green-600">{item.qty}×</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                  {item.customizations.length > 0 && (
                    <p className="text-[10px] text-gray-400">{item.customizations.join(' · ')}</p>
                  )}
                </div>
                <p className="text-sm text-gray-600 shrink-0">{formatRupiah(item.price * item.qty)}</p>
              </div>
            ))}
            <div className="flex justify-between px-1 pt-1 text-sm font-bold">
              <span className="text-gray-700">Total</span>
              <span className="text-gold">{formatRupiah(order.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add order input ──────────────────────────────────────────────────────────

function AddOrderInput({ onAdd }: { onAdd: (id: string) => void }) {
  const [code, setCode] = useState('');
  function handleAdd() {
    const trimmed = code.trim();
    if (trimmed) { onAdd(trimmed); setCode(''); }
  }
  return (
    <div className="w-full bg-cream-dark rounded-2xl p-4">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-bold">Tambah Pesanan Lain</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Masukkan booking code..."
          className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm placeholder-gray-300 outline-none focus:border-gold transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!code.trim()}
          className="bg-gold text-white px-4 rounded-xl font-bold disabled:opacity-40 flex items-center justify-center"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Empty States ─────────────────────────────────────────────────────────────

function EmptyActive({ onAdd }: { onAdd: (id: string) => void }) {
  return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-6">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-24 h-24 rounded-2xl bg-cream-dark flex items-center justify-center mb-4">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C19A38" strokeWidth="1.2">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">Tidak ada pesanan aktif</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Pesanan yang sedang diproses akan<br />muncul di sini secara real-time.
        </p>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">atau</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <AddOrderInput onAdd={onAdd} />
      <div className="mt-auto pt-6 text-center">
        <Link href="/" className="text-sm text-gold font-semibold">Pesan sekarang →</Link>
      </div>
    </div>
  );
}

function EmptyHistory() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-cream-dark flex items-center justify-center mb-4">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C19A38" strokeWidth="1.2">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <h2 className="text-base font-bold text-gray-700 mb-1">Belum ada riwayat</h2>
      <p className="text-sm text-gray-400">Pesanan selesai akan otomatis<br />muncul di sini.</p>
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

function TabBar({
  activeTab,
  onTabChange,
  activeCount,
}: {
  activeTab: 'active' | 'history';
  onTabChange: (t: 'active' | 'history') => void;
  activeCount: number;
}) {
  return (
    <div className="flex mx-4 mt-2 mb-1 bg-cream-dark rounded-2xl p-1 gap-1">
      {(['active', 'history'] as const).map((tab) => {
        const isSelected = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isSelected ? 'bg-white text-gold shadow-sm' : 'text-gray-400'
            }`}
          >
            {tab === 'active' ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                Aktif
                {activeCount > 0 && (
                  <span className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${isSelected ? 'bg-gold text-white' : 'bg-gray-300 text-white'}`}>
                    {activeCount}
                  </span>
                )}
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Riwayat
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props { orderId: string | null }

export default function TrackContent({ orderId }: Props) {
  const { user } = useAuth();
  const { completedOrders, loading: historyLoading } = useUserOrders(user?.uid ?? null);

  const [activeTab, setActiveTab]   = useState<'active' | 'history'>('active');
  const [activeIds,  setActiveIds]  = useState<string[]>([]);
  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [hydrated, setHydrated]     = useState(false);

  // ── STEP 1: Hydrate localStorage + merge orderId dari URL ──
  useEffect(() => {
    const storedActive  = loadIds(ACTIVE_KEY);
    const storedHistory = loadIds(HISTORY_KEY);

    if (orderId && !storedActive.includes(orderId)) {
      storedActive.unshift(orderId);
    }

    setActiveIds(storedActive);
    setHistoryIds(storedHistory);
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── STEP 2: Tambah orderId baru dari URL setelah hydration ──
  useEffect(() => {
    if (!hydrated || !orderId) return;
    setActiveIds((prev) => {
      if (prev.includes(orderId)) return prev;
      const next = [orderId, ...prev];
      saveIds(ACTIVE_KEY, next);
      return next;
    });
  }, [orderId, hydrated]);

  // ── STEP 3: Persist activeIds ke localStorage ──
  useEffect(() => {
    if (!hydrated) return;
    saveIds(ACTIVE_KEY, activeIds);
  }, [activeIds, hydrated]);

  // Persist historyIds hanya untuk guest (user login pakai Firestore)
  useEffect(() => {
    if (!hydrated || user) return;
    saveIds(HISTORY_KEY, historyIds);
  }, [historyIds, hydrated, user]);

  const handleMoveToHistory = useCallback((id: string) => {
    setActiveIds((prev) => {
      const next = prev.filter((o) => o !== id);
      saveIds(ACTIVE_KEY, next);
      return next;
    });
    // Guest: simpan ke localStorage. User login: Firestore otomatis update via query.
    if (!user) {
      setHistoryIds((prev) => {
        if (prev.includes(id)) return prev;
        const next = [id, ...prev];
        saveIds(HISTORY_KEY, next);
        return next;
      });
    }
    setActiveTab('history');
  }, [user]);

  const handleAdd = useCallback((id: string) => {
    setActiveIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveIds(ACTIVE_KEY, next);
      return next;
    });
  }, []);

  // Riwayat: user login → Firestore, guest → localStorage
  const shownHistoryIds = user
    ? completedOrders.map((o) => o.id)
    : historyIds;
  const historyCount = user ? completedOrders.length : historyIds.length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeCount={activeIds.length}
      />

      {/* ── Tab: AKTIF ── */}
      {activeTab === 'active' && (
        activeIds.length === 0 ? (
          <EmptyActive onAdd={handleAdd} />
        ) : (
          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 flex flex-col gap-4">
            {activeIds.map((id, index) => (
              <ActiveOrderCard
                key={id}
                orderId={id}
                index={index}
                onMoveToHistory={handleMoveToHistory}
              />
            ))}
            <AddOrderInput onAdd={handleAdd} />
            <div className="text-center">
              <Link href="/" className="text-sm text-gold font-semibold">
                Pesan sekarang →
              </Link>
            </div>
          </div>
        )
      )}

      {/* ── Tab: RIWAYAT ── */}
      {activeTab === 'history' && (
        historyLoading && user ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : shownHistoryIds.length === 0 ? (
          <EmptyHistory />
        ) : (
          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 flex flex-col gap-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {historyCount} Pesanan Selesai
            </p>
            {shownHistoryIds.map((id) => (
              <HistoryCard key={id} orderId={id} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
