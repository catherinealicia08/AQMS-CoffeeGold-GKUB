'use client';

import { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import MenuGrid from '@/components/MenuGrid';

const CATEGORIES = ['All Drinks', 'Coffee', 'Non Coffee', 'Food'];

export default function OrderPage() {
  const [activeCategory, setActiveCategory] = useState('All Drinks');

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      <AppHeader />

      {/* Hero banner */}
      <div className="mx-4 mb-4 rounded-2xl bg-cream-dark p-5 flex items-start justify-between overflow-hidden min-h-[160px]">
        <div className="flex-1">
          <h1 className="text-2xl font-bold leading-tight">
            <span className="text-gray-900">Golden</span><br />
            <span className="text-gold">Coffee</span><br />
            <span className="text-gray-900">Blend</span>
          </h1>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-[160px]">
            Experience the sun-drenched richness of our signature artisanal roast.
          </p>
        </div>

        {/* Photo + Origin card */}
        <div className="relative w-[130px] h-[150px] shrink-0 ml-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-coffee.jpg"
            alt="Coffee"
            className="w-full h-full object-cover rounded-2xl"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          {/* Origin overlay card */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[110px] bg-white rounded-xl px-3 py-2 shadow-md">
            <p className="text-[9px] font-bold text-gold uppercase tracking-wider">Origin</p>
            <p className="text-[11px] text-gray-700 font-medium leading-tight mt-0.5">Aceh Gayo Highlands, 1500m</p>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-gold text-white'
                : 'bg-cream-dark text-gold border border-gold/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      <div className="flex-1 px-4 pb-4">
        <MenuGrid category={activeCategory} />
      </div>

    </div>
  );
}
