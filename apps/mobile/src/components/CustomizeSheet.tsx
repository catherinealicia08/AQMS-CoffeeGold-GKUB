'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import type { MenuItem } from '@/types/menu';
import { formatRupiah } from '@/lib/format';

interface Props {
  item: MenuItem;
  onClose: () => void;
}

export default function CustomizeSheet({ item, onClose }: Props) {
  const { addItem } = useCart();
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    item.options?.forEach((opt) => { init[opt.name] = opt.choices[0]; });
    return init;
  });
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const addonTotal = (item.addons ?? [])
    .filter((a) => selectedAddons.includes(a.name))
    .reduce((s, a) => s + a.price, 0);

  const totalPrice = item.price + addonTotal;

  const customizationLabels = [
    ...Object.values(selections),
    ...selectedAddons,
  ];

  function handleAddToCart() {
    addItem({
      id: `${item.id}-${JSON.stringify(selections)}`,
      name: item.name,
      price: totalPrice,
      qty: 1,
      imageUrl: item.imageUrl,
      customizations: customizationLabels,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-white rounded-t-3xl p-6 pb-8">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

        <h2 className="text-base font-bold text-gray-900 mb-1">Customize the dish</h2>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-16 h-16 rounded-xl bg-cream-dark flex items-center justify-center shrink-0">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
                <rect x="16" y="18" width="32" height="30" rx="6" fill="#D4AE50" opacity="0.5" />
              </svg>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{item.name}</p>
            <p className="text-gold font-bold text-sm">{formatRupiah(item.price)}</p>
          </div>
        </div>

        {/* Options */}
        {item.options?.map((opt) => (
          <div key={opt.name} className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {opt.name}
            </p>
            <div className="flex flex-col gap-2">
              {opt.choices.map((choice) => (
                <label key={choice} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">{choice}</span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selections[opt.name] === choice
                        ? 'border-gold bg-gold'
                        : 'border-gray-300'
                    }`}
                    onClick={() => setSelections((s) => ({ ...s, [opt.name]: choice }))}
                  >
                    {selections[opt.name] === choice && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* Add-ons */}
        {item.addons && item.addons.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Add On</p>
            {item.addons.map((addon) => (
              <label key={addon.name} className="flex items-center justify-between cursor-pointer mb-2">
                <span className="text-sm text-gray-700">{addon.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gold">+{formatRupiah(addon.price)}</span>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedAddons.includes(addon.name)
                        ? 'border-gold bg-gold'
                        : 'border-gray-300'
                    }`}
                    onClick={() =>
                      setSelectedAddons((prev) =>
                        prev.includes(addon.name)
                          ? prev.filter((a) => a !== addon.name)
                          : [...prev, addon.name]
                      )
                    }
                  >
                    {selectedAddons.includes(addon.name) && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" fill="none" />
                      </svg>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        <button
          onClick={handleAddToCart}
          className="w-full bg-gold text-white font-semibold py-4 rounded-2xl text-sm"
        >
          Add to cart · {formatRupiah(totalPrice)}
        </button>
      </div>
    </div>
  );
}
