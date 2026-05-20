'use client';

import { auth } from '@aqms/shared';
import { signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface Props {
  user: User;
}

export default function UserProfile({ user }: Props) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut(auth);
    router.refresh();
  }

  return (
    <div className="flex-1 flex flex-col px-4 pt-2 pb-6">
      {/* Avatar + name */}
      <div className="flex flex-col items-center py-6">
        <div className="w-20 h-20 rounded-full bg-cream-dark overflow-hidden mb-3 flex items-center justify-center">
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt={user.displayName ?? ''} className="w-full h-full object-cover" />
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </div>
        <h2 className="text-lg font-bold text-gray-900">{user.displayName ?? 'Pengguna'}</h2>
        <p className="text-xs text-gray-400">MY PROFILE</p>
      </div>

      {/* Profile fields */}
      <div className="bg-white rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
          <input
            readOnly
            value={user.displayName ?? '—'}
            className="w-full bg-transparent text-sm text-gray-700 font-medium border-b border-gray-100 pb-1 outline-none"
          />
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
          <input
            readOnly
            value={user.email ?? '—'}
            className="w-full bg-transparent text-sm text-gray-700 font-medium border-b border-gray-100 pb-1 outline-none"
          />
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
          <input
            readOnly
            value={user.phoneNumber ?? '—'}
            className="w-full bg-transparent text-sm text-gray-700 font-medium pb-1 outline-none"
          />
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="mt-6 flex items-center justify-center gap-2 text-sm text-red-500 font-semibold"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </button>
    </div>
  );
}
