'use client';

import { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import MenuGrid from '@/components/MenuGrid';
import CartBar from '@/components/CartBar';

const CATEGORIES = ['All Drinks', 'Coffee', 'Non Coffee', 'Food'];

export default function OrderPage() {
  const [activeCategory, setActiveCategory] = useState('All Drinks');

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      <AppHeader showCart />

      {/* Hero banner */}
      <div className="mx-4 mb-4 rounded-2xl bg-cream-dark p-5 flex items-start justify-between overflow-hidden">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gold leading-tight">
            Golden<br />GKUB<br />Blend
          </h1>
          <p className="text-xs text-gold-600 mt-2 leading-relaxed max-w-[160px]">
            Experience the sun-drenched richness of our signature artisanal roast.
          </p>
          <div className="flex gap-2 mt-3">
            <span className="text-[10px] bg-gold/10 text-gold px-2 py-1 rounded-full">Sweet</span>
            <span className="text-[10px] bg-gold/10 text-gold px-2 py-1 rounded-full">Dark Highlights</span>
            <span className="text-[10px] bg-gold/10 text-gold px-2 py-1 rounded-full">Hazelnut</span>
          </div>
        </div>
        <div className="w-24 h-24 rounded-xl bg-gold-200/40 flex items-center justify-center ml-4 shrink-0">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
            <ellipse cx="32" cy="52" rx="20" ry="4" fill="#D4AE50" opacity="0.3" />
            <rect x="16" y="18" width="32" height="30" rx="6" fill="#C19A38" />
            <rect x="20" y="10" width="24" height="10" rx="3" fill="#A07820" />
            <path d="M48 28 Q56 28 56 36 Q56 44 48 44" stroke="#8B6914" strokeWidth="2" fill="none" />
          </svg>
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

      {/* Floating cart bar */}
      <CartBar />
    </div>
  );
}
