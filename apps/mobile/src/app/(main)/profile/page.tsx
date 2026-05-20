'use client';

import { useAuth } from '@/context/AuthContext';
import AppHeader from '@/components/AppHeader';
import GuestProfile from './GuestProfile';
import UserProfile from './UserProfile';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      <AppHeader />
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gold/50 text-sm">Memuat...</div>
      ) : user && !user.isAnonymous ? (
        <UserProfile user={user} />
      ) : (
        <GuestProfile />
      )}
    </div>
  );
}
