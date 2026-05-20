'use client';

import { useState } from 'react';
import { auth } from '@aqms/shared';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function BaristaLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stationId, setStationId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/barista');
    } catch {
      setError('Email atau password salah.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#6B4F0A' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gold-dark tracking-tight" style={{ color: '#6B4F0A' }}>COFFE GOLD</h1>
          <p className="text-xs text-gray-400 tracking-widest mt-1">BARISTA STATION</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Station ID</p>
            <input
              type="text"
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              placeholder="e.g. STATION-01"
              className="w-full bg-cream border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Barista ID</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="barista@coffeegold.id"
              className="w-full bg-cream border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Password</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-cream border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-semibold py-3.5 rounded-2xl text-sm disabled:opacity-60"
            style={{ backgroundColor: '#6B4F0A' }}
          >
            {loading ? 'Masuk...' : 'Login to Station'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          className="w-full bg-white border border-gray-200 py-3 rounded-2xl text-xs text-gray-500 text-center"
        >
          Need help?
        </button>

        <p className="text-center text-[10px] text-gray-300 mt-6">
          © 2024 COFFEE GOLD GKUB. All rights reserved.
        </p>
      </div>
    </div>
  );
}
