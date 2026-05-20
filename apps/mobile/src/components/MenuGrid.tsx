'use client';

import { useMenu } from '@/hooks/useMenu';
import { useCart } from '@/context/CartContext';
import { useCartSheet } from '@/context/CartSheetContext';
import { useRouter } from 'next/navigation';
import type { MenuItem } from '@/types/menu';
import { formatRupiah } from '@/lib/format';

interface MenuGridProps {
  category: string;
}

export default function MenuGrid({ category }: MenuGridProps) {
  const { items, loading } = useMenu(category);
  const { items: cartItems } = useCart();
  const { openSheet } = useCartSheet();
  const router = useRouter();

  function openCustomize(item: MenuItem) {
    sessionStorage.setItem(`customize_${item.id}`, JSON.stringify(item));
    router.push(`/customize/${item.id}`);
  }

  // Sum qty across all cart entries for this menu item (different customizations)
  const getQty = (id: string) =>
    cartItems
      .filter((i) => i.id === id || i.id.startsWith(id + '-'))
      .reduce((sum, i) => sum + i.qty, 0);

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
    return <p className="text-center text-gold/50 mt-12 text-sm">Tidak ada menu tersedia</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 pb-36">
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
                  <button
                    onClick={openSheet}
                    className="flex items-center gap-1 bg-gold text-white px-3 py-1 rounded-full"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                    <span className="text-xs font-black">{qty}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => openCustomize(item)}
                    className="w-7 h-7 rounded-full bg-gold text-white text-xl font-bold flex items-center justify-center leading-none"
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
  );
}
