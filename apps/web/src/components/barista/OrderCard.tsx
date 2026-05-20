'use client';

import { useState } from 'react';
import type { Order } from '@/types/order';
import { formatRupiah, formatTime } from '@/lib/format';
import { markOrderReady } from '@/lib/orderActions';
import { QUEUE_STATUS } from '@aqms/shared';

interface Props {
  order: Order;
  isCompleted?: boolean;
}

export default function OrderCard({ order, isCompleted }: Props) {
  const [marking, setMarking] = useState(false);

  const createdAt = order.created_at?.toDate();

  async function handleMarkReady() {
    setMarking(true);
    try {
      await markOrderReady(order.id);
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 min-w-[200px] w-[220px] shrink-0 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            {createdAt ? formatTime(createdAt) : '—'}
          </p>
          <h3 className="text-lg font-black text-gray-900 leading-tight">
            #{order.queue_number ?? order.id.substring(0, 4).toUpperCase()}
          </h3>
          <p className="text-sm font-semibold text-gray-700">{order.user_name}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400">
            {createdAt ? `${createdAt.getDate()} ${createdAt.toLocaleString('id-ID', { month: 'short' })}` : '—'}
          </p>
          <p className="text-xs font-semibold text-gold">
            {createdAt ? formatTime(createdAt) : '—'}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-xs">
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-800 truncate block">
                {item.qty}x {item.name}
              </span>
              {item.customizations.length > 0 && (
                <span className="text-gray-400 text-[10px]">{item.customizations.join(' · ')}</span>
              )}
            </div>
            <span className="text-gray-500 ml-2 shrink-0">{formatRupiah(item.price * item.qty)}</span>
          </div>
        ))}
      </div>

      {/* Late badge if in_progress too long */}
      {order.status === QUEUE_STATUS.IN_PROGRESS && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 text-[10px] text-amber-700 font-semibold text-center">
          SEDANG DIPROSES
        </div>
      )}

      {/* Action */}
      {!isCompleted ? (
        <button
          onClick={handleMarkReady}
          disabled={marking}
          className="w-full text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-60 transition-opacity"
          style={{ backgroundColor: '#6B4F0A' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {marking ? 'Memproses...' : 'Mark as Ready'}
        </button>
      ) : (
        <div className="w-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Done
        </div>
      )}
    </div>
  );
}
