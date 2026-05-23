'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useCartSheet } from '@/context/CartSheetContext';
import { useRouter, usePathname } from 'next/navigation';
import { formatRupiah } from '@/lib/format';


function CartSheet({ onClose }: { onClose: () => void }) {
  const { items, increment, decrement, total, totalItems } = useCart();
  const router = useRouter();

  function openCustomize(cartItemId: string) {
    // cartItemId format: `${menuItemId}-...`, retrieve stored MenuItem from sessionStorage
    const menuItemId = cartItemId.split('-')[0];
    const raw = sessionStorage.getItem(`customize_${menuItemId}`);
    if (raw) {
      onClose();
      router.push(`/customize/${menuItemId}`);
    }
  }

  function handleAddNew(menuItemId: string, menuItemJson: string) {
    sessionStorage.setItem(`customize_${menuItemId}`, menuItemJson);
    onClose();
    router.push(`/customize/${menuItemId}`);
  }

  function handleCheckout() {
    onClose();
    router.push('/checkout');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-cream rounded-t-3xl flex flex-col" style={{ maxHeight: 'calc(100dvh - 64px)' }}>
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1 shrink-0" />

        {/* Header */}
        <div className="relative flex items-center justify-center px-5 py-3 shrink-0 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Keranjang</h2>
          {totalItems > 0 && (
            <span className="absolute right-5 text-xs text-gray-400">{totalItems} item</span>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="h-40 flex items-center justify-center">
              <p className="text-sm text-gold/60 font-medium">Kamu belum memilih item</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item) => {
                const menuItemId = item.id.split('-')[0];
                return (
                  <div key={item.id} className="rounded-2xl p-3 flex items-start gap-3" style={{ backgroundColor: '#FBF7F0' }}>
                    {/* Image */}
                    <div className="w-20 h-20 rounded-xl bg-cream-dark overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
                            <rect x="16" y="18" width="32" height="30" rx="6" fill="#D4AE50" opacity="0.5" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info + controls */}
                    <div className="flex-1 min-w-0 flex flex-col min-h-[80px]">
                      {/* Row 1: name (left) + Ubah (right) */}
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-bold text-gray-900 leading-tight">{item.name}</p>
                        <button
                          onClick={() => openCustomize(item.id)}
                          className="text-xs font-semibold shrink-0 leading-tight"
                          style={{ color: '#C19A38' }}
                        >
                          Ubah
                        </button>
                      </div>

                      {/* Row 2: customization tags */}
                      {item.customizations.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.customizations.map((c) => (
                            <span key={c} className="tag">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Row 3: price (left) + qty pill (right) — pushed to bottom */}
                      <div className="flex items-end justify-between mt-auto">
                        <p className="text-sm font-semibold text-gray-900">{formatRupiah(item.price)}</p>
                        {/* Qty pill */}
                        <div className="flex items-center bg-gold rounded-full h-7 w-[84px]">
                          <button
                            onClick={() => decrement(item.id)}
                            className="w-7 h-7 flex items-center justify-center text-white text-xl font-medium"
                          >
                            −
                          </button>
                          <span className="flex-1 text-center text-white text-sm font-semibold">{item.qty}</span>
                          <button
                            onClick={() => {
                              const raw = sessionStorage.getItem(`customize_${menuItemId}`);
                              if (raw) handleAddNew(menuItemId, raw);
                              else increment(item.id);
                            }}
                            className="w-7 h-7 flex items-center justify-center text-white text-xl font-medium"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Checkout bar — gradient, sits above BottomNav */}
        <div className="px-4 pt-2 pb-[calc(1rem+64px)] shrink-0">
          <button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full py-4 rounded-2xl flex items-center justify-between px-5 disabled:opacity-40 transition-opacity shadow-[0px_25px_50px_-12px_rgba(119,90,25,0.40)] gradient-gold-h"
          >
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-white/70 font-bold uppercase">{totalItems}</span>
                  <span className="text-[10px] text-white/70 font-bold uppercase">ITEMS</span>
                </div>
                <p className="text-base font-bold text-white leading-tight">{formatRupiah(total)}</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm flex items-center gap-2">
              <span className="text-sm font-bold text-white">Checkout</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartBar() {
  const { totalItems } = useCart();
  const { open, openSheet, closeSheet } = useCartSheet();
  const pathname = usePathname();

  // Close sheet and hide button when navigating away from order page
  useEffect(() => {
    if (pathname !== '/') {
      closeSheet();
    }
  }, [pathname, closeSheet]);

  // just show on order page
  if (pathname !== '/') return
  null;

  return (
    <>
      {/* Floating cart button above BottomNav with gap */}
      <div className="fixed bottom-[76px] right-4 z-40">
        <button
          onClick={openSheet}
          className="relative w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
          style={{ backgroundColor: '#6B4F0A' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </button>
      </div>

      {open && <CartSheet onClose={closeSheet} />}
    </>
  );
}
