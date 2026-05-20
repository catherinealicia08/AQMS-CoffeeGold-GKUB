'use client';

import { useState, useEffect } from 'react';
import { useOrder } from '@/hooks/useOrder';
import type { Order } from '@/hooks/useOrder';
import { QUEUE_STATUS } from '@aqms/shared';
import { formatRupiah } from '@/lib/format';
import Link from 'next/link';

const COMPLETED_EXPIRY_MS = 5 * 60 * 1000;

const STATUS_LABEL: Record<string, string> = {
  [QUEUE_STATUS.QUEUED]: 'PROCESSING',
  [QUEUE_STATUS.IN_PROGRESS]: 'PROCESSING',
  [QUEUE_STATUS.COMPLETED]: 'SELESAI',
};

interface Props {
  orderId: string | null;
}

// --- Single order card ---

interface CardProps {
  orderId: string;
  onRemove: (id: string) => void;
}

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

function OrderCard({ orderId, onRemove }: CardProps) {
  const { order, loading } = useOrder(orderId);
  const isExpired = useCompletedExpired(order?.completed_at);

  useEffect(() => {
    if (isExpired) onRemove(orderId);
  }, [isExpired, orderId, onRemove]);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl p-5 flex items-center justify-center h-24">
        <div className="w-5 h-5 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full bg-white rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700">Order tidak ditemukan</p>
          <p className="text-xs text-gray-400 font-mono">{orderId.substring(0, 12).toUpperCase()}</p>
        </div>
        <button onClick={() => onRemove(orderId)} className="text-gray-300 hover:text-red-400 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    );
  }

  const isCompleted = order.status === QUEUE_STATUS.COMPLETED;

  return (
    <div className={`w-full bg-white rounded-2xl overflow-hidden shadow-sm border ${isCompleted ? 'border-green-200' : 'border-transparent'}`}>
      {/* Card header */}
      <div className={`flex items-center justify-between px-4 py-3 ${isCompleted ? 'bg-green-50' : 'bg-gold/5'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gold animate-pulse'}`} />
          <span className={`text-xs font-bold tracking-wider ${isCompleted ? 'text-green-700' : 'text-gold'}`}>
            {STATUS_LABEL[order.status] ?? order.status.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {order.queue_number && (
            <span className={`text-sm font-black ${isCompleted ? 'text-green-700' : 'text-gold'}`}>
              #{order.queue_number}
            </span>
          )}
          <button onClick={() => onRemove(orderId)} className="text-gray-300 hover:text-red-400 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Status illustration */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-50">
        {isCompleted ? (
          <>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Pesanan Siap!</p>
              <p className="text-xs text-gray-400">Silakan ambil di counter</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Sedang Dibuat</p>
              <p className="text-xs text-gray-400">~3 Menit Lagi</p>
            </div>
          </>
        )}
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-1.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-gray-700 font-medium">{item.qty}x {item.name}</span>
            <span className="text-gray-500 shrink-0 ml-2">{formatRupiah(item.price * item.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between text-xs font-bold text-gray-900 pt-1 border-t border-gray-50">
          <span>Total</span>
          <span className="text-gold">{formatRupiah(order.total)}</span>
        </div>
      </div>
    </div>
  );
}

// --- Add order input ---

function AddOrderInput({ onAdd }: { onAdd: (id: string) => void }) {
  const [code, setCode] = useState('');

  function handleAdd() {
    const trimmed = code.trim();
    if (trimmed) {
      onAdd(trimmed);
      setCode('');
    }
  }

  return (
    <div className="w-full bg-cream-dark rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Tambah Pesanan</span>
      </div>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Enter Booking Code</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Ex: GKUB-9921-X"
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

export default function TrackContent({ orderId }: Props) {
  const [orderIds, setOrderIds] = useState<string[]>(() =>
    orderId ? [orderId] : []
  );

  // Sync kalau orderId dari URL berubah (misal dari checkout redirect)
  useEffect(() => {
    if (orderId && !orderIds.includes(orderId)) {
      setOrderIds((prev) => [orderId, ...prev]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  function handleAdd(id: string) {
    if (!orderIds.includes(id)) {
      setOrderIds((prev) => [...prev, id]);
    }
  }

  function handleRemove(id: string) {
    setOrderIds((prev) => prev.filter((o) => o !== id));
  }

  if (orderIds.length === 0) {
    return <EmptyState onAdd={handleAdd} />;
  }

  return (
    <div className="flex-1 flex flex-col px-4 pt-4 pb-6 gap-4">
      {orderIds.map((id) => (
        <OrderCard key={id} orderId={id} onRemove={handleRemove} />
      ))}
      <AddOrderInput onAdd={handleAdd} />
      <div className="text-center">
        <Link href="/" className="text-sm text-gold font-semibold">
          Pesan sekarang →
        </Link>
      </div>
    </div>
  );
}
