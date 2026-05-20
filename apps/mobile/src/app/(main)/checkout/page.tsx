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
  const { items, total, clear } = useCart();
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
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 safe-top">
        <button onClick={() => router.back()} className="p-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="flex-1 px-4 space-y-4 overflow-y-auto pb-36">
        {/* Order type */}
        <div className="bg-white rounded-2xl p-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Order Type</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Takeaway Only</p>
              <p className="text-xs text-gray-400">Ready for pickup in 15 mins</p>
            </div>
            <div className="w-10 h-10 bg-cream-dark rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl p-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Order Summary</p>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cream-dark flex items-center justify-center shrink-0">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
                      <rect x="16" y="18" width="32" height="30" rx="6" fill="#D4AE50" opacity="0.5" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.customizations.join(' · ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatRupiah(item.price)}</p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <span className="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full">× {item.qty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-2xl p-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Payment Method</p>
          <div className="flex items-center gap-3 p-3 border-2 border-gold rounded-xl">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center shrink-0">
              <span className="text-white text-[9px] font-black">QRIS</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">QRIS</span>
          </div>
        </div>

        {/* Summary totals */}
        <div className="bg-white rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatRupiah(total)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Service Charge</span>
            <span>{formatRupiah(serviceCharge)}</span>
          </div>
          <div className="h-px bg-gray-100 my-1" />
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total Amount</span>
            <span className="text-gold text-lg">{formatRupiah(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Pay button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-4 bg-cream border-t border-cream-dark">
        <button
          onClick={handlePay}
          disabled={loading || items.length === 0}
          className="w-full bg-gold-700 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ backgroundColor: '#6B4F0A' }}
        >
          {loading ? 'Memproses...' : <>Pay Now <span>→</span></>}
        </button>
      </div>
    </div>
  );
}
