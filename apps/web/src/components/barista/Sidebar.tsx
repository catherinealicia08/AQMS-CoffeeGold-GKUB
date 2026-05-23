'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';

const NAV_ITEMS = [
  {
    label: 'INCOMING',
    href: '/barista',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    label: 'COMPLETED',
    href: '/barista',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    label: 'DASHBOARD',
    href: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
];

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: User;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, onTabChange, user, onLogout }: Props) {
  const [showLogout, setShowLogout] = useState(false);
  const router = useRouter();

  function handleNav(item: typeof NAV_ITEMS[number]) {
    if (item.label === 'DASHBOARD') {
      router.push('/dashboard');
    } else {
      if (activeTab === 'DASHBOARD') router.push('/barista');
      onTabChange(item.label);
    }
  }

  return (
    <aside className="w-20 bg-white border-r border-gray-100 flex flex-col items-center py-4 gap-6 shrink-0">
      {/* Logo */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#6B4F0A' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 w-full px-2 mt-2">
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.label;
          return (
            <button
              key={item.label}
              onClick={() => handleNav(item)}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl w-full transition-colors ${
                active ? 'text-gold bg-gold/10' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {item.icon}
              <span className="text-[8px] font-bold tracking-wider leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User card */}
      <div className="mt-auto w-full px-2 relative">
        <button
          onClick={() => setShowLogout((v) => !v)}
          className="w-full flex flex-col items-center gap-1 bg-cream rounded-xl py-2 px-1 transition-colors hover:bg-cream-dark"
        >
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B4F0A" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className="text-[8px] font-bold text-gold-dark truncate w-full text-center" style={{ color: '#6B4F0A' }}>
            {user.displayName?.split(' ')[0] ?? 'Barista'}
          </span>
        </button>

        {/* Logout popup */}
        {showLogout && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-2xl shadow-lg p-4 z-50">
            <p className="text-[10px] text-gray-400 mb-1">Logged in as</p>
            <p className="text-xs font-semibold text-gray-800 truncate mb-3">{user.displayName ?? user.email}</p>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 text-red-500 hover:bg-red-50 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
