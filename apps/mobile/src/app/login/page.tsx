'use client';

import { useState } from 'react';
import { auth } from '@aqms/shared';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/');
    } catch {
      setError('Email atau password salah.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGuest() {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      router.replace('/');
    } catch {
      setError('Gagal masuk sebagai tamu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-cream flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gold-dark flex items-center justify-center mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <h1 className="text-xl font-black text-gold">Welcome Back to</h1>
          <h2 className="text-2xl font-black text-gold">Coffee Gold</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <p className="section-label-gray mb-1.5">Email</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="input"
            />
          </div>
          <div>
            <p className="section-label-gray mb-1.5">Password</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="input"
            />
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-gold">Forgot password?</Link>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold gap-2"
          >
            {loading ? 'Masuk...' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">atau</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Guest login */}
        <button
          onClick={handleGuest}
          disabled={loading}
          className="w-full bg-white border border-gray-200 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Login as Guest
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t Have An Account?{' '}
          <Link href="/register" className="text-gold font-semibold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
