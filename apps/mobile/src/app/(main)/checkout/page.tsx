'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@aqms/shared';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { formatRupiah } from '@/lib/format';

const SERVICE_CHARGE_RATE = 0.05;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clear, increment, decrement } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const serviceCharge = Math.round(total * SERVICE_CHARGE_RATE);
  const grandTotal = total + serviceCharge;

  async function handlePay() {
    if (items.length === 0) return;
    setLoading(true);

    try {
      const orderData = {
        user_id: user?.uid ?? null,
        user_name: user?.displayName ?? 'Tamu',
        items: items.map((i) => ({
          product_id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          customizations: i.customizations,
        })),
        subtotal: total,
        service_charge: serviceCharge,
        total: grandTotal,
        payment_method: 'qris',
        status: 'queued',
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      clear();
      router.replace(`/track?orderId=${docRef.id}`);
    } catch (err) {
      console.error('Order failed', err);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Sticky blur header */}
      <div className="sticky top-0 z-10 bg-cream/80 backdrop-blur-md border-b border-black/5">
        <div className="flex items-center gap-4 px-6 py-4">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B4F0A" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gold">Checkout</h1>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-36 space-y-4 overflow-y-auto">

        {/* Order type */}
        <div className="bg-cream-dark rounded-2xl px-5 py-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold text-gold uppercase tracking-wider">Order Type</p>
            <p className="text-lg font-extrabold text-gray-900">Takeaway Only</p>
            <p className="text-xs text-gray-500">Ready for pickup in 15 mins</p>
          </div>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C19A38" strokeWidth="1.5" opacity="0.35">
            <path d="M1 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5h12M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        </div>

        {/* Order summary */}
        <div className="flex flex-col gap-3">
          <p className="section-label-gray">Order Summary</p>
          <div className="flex flex-col gap-4">
            {items.map((item, i) => (
              <div key={item.id}>
                {i > 0 && <div className="h-px bg-gray-200/60 my-1" />}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-cream-dark shrink-0">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
                          <rect x="16" y="18" width="32" height="30" rx="6" fill="#D4AE50" opacity="0.5" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex gap-2">
                    {/* Left: name + tags */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-gray-900 leading-snug">{item.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.customizations.map((c) => (
                          <span key={c} className="tag">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Right: price + qty pill stacked */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="text-base font-semibold text-gray-900">{formatRupiah(item.price)}</p>
                      <div className="flex items-center bg-gold rounded-full h-8 w-24">
                        <button onClick={() => decrement(item.id)} className="w-8 h-8 flex items-center justify-center text-white text-xl font-medium">−</button>
                        <span className="flex-1 text-center text-white text-sm font-bold">{item.qty}</span>
                        <button onClick={() => increment(item.id)} className="w-8 h-8 flex items-center justify-center text-white text-xl font-medium">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div className="flex flex-col gap-3">
          <p className="section-label-gray">Payment Method</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white text-[9px] font-black">QRIS</span>
            </div>
            <p className="text-base font-semibold text-gray-900">QRIS</p>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-cream-dark rounded-2xl px-5 py-4 flex flex-col gap-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Subtotal</span>
            <span className="text-sm font-medium text-gray-900">{formatRupiah(total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Service Charge</span>
            <span className="text-sm font-medium text-gray-900">{formatRupiah(serviceCharge)}</span>
          </div>
          <div className="pt-3 border-t border-gray-200/60 flex justify-between items-baseline">
            <span className="text-base font-bold text-gray-900">Total Amount</span>
            <span className="text-2xl font-extrabold text-gold">{formatRupiah(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Pay Now CTA */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 py-4 bg-cream/90 border-t border-stone-300/20 backdrop-blur-md">
        <button
          onClick={handlePay}
          disabled={loading || items.length === 0}
          className="btn-primary gap-3 shadow-[0px_10px_15px_-3px_rgba(119,90,25,0.20)]"
        >
          {loading ? 'Memproses...' : (
            <>
              <span>Pay Now</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
