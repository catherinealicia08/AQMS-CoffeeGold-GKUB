'use client';

import Link from 'next/link';

export default function GuestProfile() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-cream-dark flex items-center justify-center mb-4">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Halo, Tamu!</h2>
      <p className="text-sm text-gray-400 mb-6">Anda masuk sebagai Tamu<br />Silakan login</p>
      <Link
        href="/login"
        className="bg-gold text-white font-semibold px-8 py-3.5 rounded-2xl flex items-center gap-2 text-sm"
      >
        Login
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
      </Link>
    </div>
  );
}
