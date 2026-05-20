'use client';

import { auth } from '@aqms/shared';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  {
    label: 'INCOMING',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    label: 'COMPLETED',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
];

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut(auth);
    router.replace('/barista/login');
  }

  return (
    <aside className="w-16 bg-white border-r border-gray-100 flex flex-col items-center py-4 gap-6 shrink-0">
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
              onClick={() => onTabChange(item.label)}
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

      {/* User avatar */}
      <div className="mt-auto flex flex-col items-center gap-1">
        <button
          onClick={handleSignOut}
          title="Logout"
          className="w-9 h-9 rounded-full bg-cream-dark flex items-center justify-center overflow-hidden"
        >
          {user?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </button>
        <span className="text-[8px] text-gray-400 text-center leading-tight max-w-[50px] truncate">
          {user?.displayName?.split(' ')[0] ?? 'Barista'}
        </span>
      </div>
    </aside>
  );
}
