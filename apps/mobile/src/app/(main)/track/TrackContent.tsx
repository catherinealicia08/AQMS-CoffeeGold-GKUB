'use client';

import { useState, useEffect } from 'react';
import { useOrder } from '@/hooks/useOrder';
import type { Order } from '@/hooks/useOrder';
import { QUEUE_STATUS } from '@aqms/shared';
import Link from 'next/link';

const COMPLETED_EXPIRY_MS = 5 * 60 * 1000;

function useCompletedExpired(completedAt: Order['completed_at']) {
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    if (!completedAt) return;
    const completedTime = completedAt.toDate().getTime();
    function check() {
      if (Date.now() - completedTime >= COMPLETED_EXPIRY_MS) setExpired(true);
    }
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, [completedAt]);
  return expired;
}

// --- Hero card (primary order, shown large) ---

function HeroCard({ orderId, onRemove }: { orderId: string; onRemove: (id: string) => void }) {
  const { order, loading } = useOrder(orderId);
  const isExpired = useCompletedExpired(order?.completed_at);

  useEffect(() => {
    if (isExpired) onRemove(orderId);
  }, [isExpired, orderId, onRemove]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
        <p className="text-sm text-gray-500">Order tidak ditemukan</p>
        <button onClick={() => onRemove(orderId)} className="text-xs text-red-400 underline">Hapus</button>
      </div>
    );
  }

  const isCompleted = order.status === QUEUE_STATUS.COMPLETED;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 pt-4 pb-2">
      {/* Status icon */}
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 ${isCompleted ? 'bg-green-50' : 'bg-cream-dark'}`}>
        {isCompleted ? (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="1.5">
            <path d="M5 3H19V7L14 12L19 17V21H5V17L10 12L5 7V3Z" />
          </svg>
        )}
      </div>

      {/* Status badge */}
      <div className={`px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-gold/10 text-gold'}`}>
        {isCompleted ? 'SELESAI' : 'PROCESSING'}
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 text-center leading-snug mb-1">
        {isCompleted ? 'Kopi Anda Siap!' : 'Kopi Anda Sedang\nDibuat'}
      </h1>
      {isCompleted && (
        <p className="text-sm mb-6 text-green-600 font-medium">Silakan ambil di counter</p>
      )}
      {!isCompleted && <div className="mb-6" />}

      {/* Queue number card */}
      <div className={`w-full rounded-2xl px-6 py-5 text-center ${isCompleted ? 'bg-green-500' : 'bg-gold'}`}>
        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Nomor Anda</p>
        <p className="text-6xl font-black text-white leading-none mb-3">
          {order.queue_number ?? '—'}
        </p>
        {!isCompleted && (
          <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[11px] text-white font-semibold">~3 Menit Lagi</span>
          </div>
        )}
      </div>

    </div>
  );
}

// --- Mini card for secondary orders ---

function MiniCard({ orderId, onRemove, onPromote }: { orderId: string; onRemove: (id: string) => void; onPromote: (id: string) => void }) {
  const { order, loading } = useOrder(orderId);
  const isExpired = useCompletedExpired(order?.completed_at);

  useEffect(() => {
    if (isExpired) onRemove(orderId);
  }, [isExpired, orderId, onRemove]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-center h-14 shrink-0">
        <div className="w-4 h-4 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const isCompleted = order.status === QUEUE_STATUS.COMPLETED;

  return (
    <button
      onClick={() => onPromote(orderId)}
      className={`w-full bg-white rounded-xl px-4 py-3 flex items-center gap-3 shrink-0 text-left border ${isCompleted ? 'border-green-200' : 'border-gray-100'}`}
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${isCompleted ? 'bg-green-500' : 'bg-gold animate-pulse'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 truncate">
          #{order.queue_number} · {order.items.map(i => i.name).join(', ')}
        </p>
        <p className={`text-[10px] ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
          {isCompleted ? 'Siap diambil' : 'Sedang dibuat'}
        </p>
      </div>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C19A38" strokeWidth="2.5">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}

// --- Add order input ---

function AddOrderInput({ onAdd }: { onAdd: (id: string) => void }) {
  const [code, setCode] = useState('');

  function handleAdd() {
    const trimmed = code.trim();
    if (trimmed) { onAdd(trimmed); setCode(''); }
  }

  return (
    <div className="w-full bg-cream-dark rounded-2xl p-4 shrink-0">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-bold">Tambah Pesanan Lain</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Masukkan booking code..."
          className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-gold transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!code.trim()}
          className="bg-gold text-white px-4 rounded-xl font-bold disabled:opacity-40 transition-opacity flex items-center justify-center"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// --- Empty state ---

function EmptyState({ onAdd }: { onAdd: (id: string) => void }) {
  return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-6">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-2xl bg-cream-dark flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C19A38" strokeWidth="1.2">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">No active journeys</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          You have no active orders from the app.<br />
          Brewing something new? Your progress will<br />
          appear here.
        </p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">atau</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <AddOrderInput onAdd={onAdd} />

      <div className="mt-auto pt-6 text-center">
        <Link href="/" className="text-sm text-gold font-semibold">
          Pesan sekarang →
        </Link>
      </div>
    </div>
  );
}

// --- Main ---

interface Props { orderId: string | null }

export default function TrackContent({ orderId }: Props) {
  const [orderIds, setOrderIds] = useState<string[]>(() =>
    orderId ? [orderId] : []
  );

  useEffect(() => {
    if (orderId && !orderIds.includes(orderId)) {
      setOrderIds((prev) => [orderId, ...prev]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  function handleAdd(id: string) {
    if (!orderIds.includes(id)) setOrderIds((prev) => [...prev, id]);
  }

  function handleRemove(id: string) {
    setOrderIds((prev) => prev.filter((o) => o !== id));
  }

  // Tap mini card → promote it to hero (swap to front)
  function handlePromote(id: string) {
    setOrderIds((prev) => [id, ...prev.filter((o) => o !== id)]);
  }

  if (orderIds.length === 0) return <EmptyState onAdd={handleAdd} />;

  const [primaryId, ...secondaryIds] = orderIds;

  return (
    <div className="flex-1 flex flex-col pb-6 gap-4">
      {/* Hero */}
      <HeroCard orderId={primaryId} onRemove={handleRemove} />

      {/* Secondary orders + add input */}
      {(secondaryIds.length > 0 || true) && (
        <div className="px-4 flex flex-col gap-3">
          {secondaryIds.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pesanan Lain</p>
              {secondaryIds.map((id) => (
                <MiniCard key={id} orderId={id} onRemove={handleRemove} onPromote={handlePromote} />
              ))}
            </>
          )}
          <AddOrderInput onAdd={handleAdd} />
          <div className="text-center">
            <Link href="/" className="text-sm text-gold font-semibold">
              Pesan sekarang →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
