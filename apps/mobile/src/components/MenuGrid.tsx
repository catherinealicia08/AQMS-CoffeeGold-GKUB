'use client';

import { useState } from 'react';
import { useMenu } from '@/hooks/useMenu';
import { useCart } from '@/context/CartContext';
import CustomizeSheet from './CustomizeSheet';
import type { MenuItem } from '@/types/menu';
import { formatRupiah } from '@/lib/format';

interface MenuGridProps {
  category: string;
}

export default function MenuGrid({ category }: MenuGridProps) {
  const { items, loading } = useMenu(category);
  const { increment, decrement, items: cartItems } = useCart();
  const [customizing, setCustomizing] = useState<MenuItem | null>(null);

  const getQty = (id: string) => cartItems.find((i) => i.id === id)?.qty ?? 0;

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-cream-dark h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-center text-gold/50 mt-12 text-sm">Tidak ada menu tersedia</p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const qty = getQty(item.id);
          return (
            <div key={item.id} className="rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className="relative h-28 bg-cream-dark flex items-center justify-center">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
                    <rect x="16" y="18" width="32" height="30" rx="6" fill="#D4AE50" opacity="0.5" />
                    <rect x="20" y="10" width="24" height="10" rx="3" fill="#A07820" opacity="0.5" />
                  </svg>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-gray-800 leading-tight">{item.name}</p>
                <p className="text-xs text-gold font-bold mt-1">{formatRupiah(item.price)}</p>
                <div className="mt-2 flex items-center justify-end">
                  {qty > 0 ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => decrement(item.id)}
                        className="w-6 h-6 rounded-full bg-gold text-white text-sm font-bold flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">{qty}</span>
                      <button
                        onClick={() => setCustomizing(item)}
                        className="w-6 h-6 rounded-full bg-gold text-white text-sm font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCustomizing(item)}
                      className="w-7 h-7 rounded-full bg-gold text-white text-lg font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {customizing && (
        <CustomizeSheet item={customizing} onClose={() => setCustomizing(null)} />
      )}
    </>
  );
}
