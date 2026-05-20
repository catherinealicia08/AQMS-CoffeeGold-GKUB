'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import type { MenuItem } from '@/types/menu';
import { formatRupiah } from '@/lib/format';

export default function CustomizePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [qty, setQty] = useState(1);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem(`customize_${id}`);
    if (!raw) { router.replace('/'); return; }
    const parsed: MenuItem = JSON.parse(raw);
    setItem(parsed);
    const init: Record<string, string> = {};
    parsed.options?.forEach((opt) => { init[opt.name] = opt.choices[0]; });
    setSelections(init);
  }, [id, router]);

  if (!item) return null;

  const addonTotal = (item.addons ?? [])
    .filter((a) => selectedAddons.includes(a.name))
    .reduce((s, a) => s + a.price, 0);

  const optionTotal = (item.options ?? []).reduce((s, opt) => {
    const choiceIndex = opt.choices.indexOf(selections[opt.name]);
    const price = opt.prices?.[choiceIndex] ?? 0;
    return s + price;
  }, 0);

  const unitPrice = item.price + addonTotal + optionTotal;
  const totalPrice = unitPrice * qty;
  const customizationLabels = [...Object.values(selections), ...selectedAddons];

  function handleAddToCart() {
    addItem({
      id: `${item!.id}-${JSON.stringify(selections)}-${selectedAddons.join(',')}`,
      name: item!.name,
      price: unitPrice,
      qty,
      imageUrl: item!.imageUrl,
      customizations: customizationLabels,
    });
    router.back();
  }

  return (
    <div className="flex flex-col min-h-dvh bg-cream relative">

      {/* Sticky header — blur */}
      <div className="sticky top-0 z-10 bg-cream/80 backdrop-blur-md border-b border-black/5 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B4F0A" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gold">Customize the dish</h1>
          <div className="w-10 h-10" />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32 flex flex-col gap-4">

        {/* ORDER SUMMARY */}
        <div className="flex flex-col gap-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order Summary</p>
          <div className="flex items-start gap-4">
            {/* Image */}
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-cream-dark shrink-0">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
                    <rect x="16" y="18" width="32" height="30" rx="6" fill="#D4AE50" opacity="0.5" />
                  </svg>
                </div>
              )}
            </div>

            {/* Name + price + qty */}
            <div className="flex-1 flex flex-col justify-center gap-1">
              <div className="flex items-start justify-between gap-4">
                <p className="text-base font-bold text-gray-900">{item.name}</p>
                <p className="text-base font-medium text-gray-900 shrink-0">{formatRupiah(item.price)}</p>
              </div>
              <div className="flex justify-end">
                <div className="flex items-center gap-0 bg-gold rounded-full h-7 w-20">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 flex items-center justify-center text-white text-xl font-medium"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-white text-base font-normal">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-7 h-7 flex items-center justify-center text-white text-xl font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Options */}
        {item.options?.map((opt) => {
          // Hide Size option when Hot is selected
          const isHot = selections['Temperature']?.toLowerCase() === 'hot';
          if (opt.name.toLowerCase() === 'size' && isHot) return null;
          return (
          <div key={opt.name} className="flex flex-col gap-1.5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{opt.name}</p>
            <div className="flex flex-col gap-0">
              {opt.choices.map((choice, i) => {
                const price = opt.prices?.[i] ?? 0;
                return (
                  <div key={choice} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">{choice}</span>
                      {price > 0 && (
                        <span className="text-xs text-gold font-medium">+ {formatRupiah(price)}</span>
                      )}
                    </div>
                    <button
                      onClick={() => setSelections((s) => ({ ...s, [opt.name]: choice }))}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        selections[opt.name] === choice
                          ? 'border-gold bg-gold'
                          : 'border-gray-400 bg-transparent'
                      }`}
                    >
                      {selections[opt.name] === choice && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          );
        })}

        {/* Add-ons */}
        {item.addons && item.addons.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Add On</p>
            <div className="flex flex-col gap-2">
              {item.addons.map((addon) => {
                const isHot = selections['Temperature']?.toLowerCase() === 'hot';
                if (addon.name.toLowerCase() === 'upsize' && isHot) return null;
                return (
                <div key={addon.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{addon.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">+ {formatRupiah(addon.price)}</span>
                    <button
                      onClick={() =>
                        setSelectedAddons((prev) =>
                          prev.includes(addon.name)
                            ? prev.filter((a) => a !== addon.name)
                            : [...prev, addon.name]
                        )
                      }
                      className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                        selectedAddons.includes(addon.name)
                          ? 'border-gold bg-gold'
                          : 'border-gray-400 bg-cream'
                      }`}
                    >
                      {selectedAddons.includes(addon.name) && (
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA — blur + gradient button */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 py-3 bg-cream/90 backdrop-blur-md z-10">
        <button
          onClick={handleAddToCart}
          className="btn-primary shadow-[0px_10px_15px_-3px_rgba(119,90,25,0.20)]"
        >
          Add to cart · {formatRupiah(totalPrice)}
        </button>
      </div>
    </div>
  );
}
