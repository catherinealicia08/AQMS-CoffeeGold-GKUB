'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '@/lib/format';

export default function CartBar() {
  const { totalItems, total } = useCart();
  const router = useRouter();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-40">
      <button
        onClick={() => router.push('/checkout')}
        className="w-full bg-gold-700 text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg"
        style={{ backgroundColor: '#6B4F0A' }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-[10px] font-semibold opacity-80 leading-none">{totalItems} ITEMS</p>
            <p className="text-base font-bold leading-tight">{formatRupiah(total)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 font-semibold text-sm">
          Checkout <span>→</span>
        </div>
      </button>
    </div>
  );
}
