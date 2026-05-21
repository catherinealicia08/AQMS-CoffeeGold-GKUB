'use client';

import { useState } from 'react';
import { auth } from '@aqms/shared';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch {
      setError('Email tidak ditemukan. Periksa kembali alamat email kamu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-cream flex flex-col">
      <div className="flex items-center px-6 pt-6">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B4F0A" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Lupa Password?</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            Masukkan email kamu dan kami akan mengirimkan link untuk reset password.
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="section-label-gray mb-1.5">Email Address</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="input"
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold gap-2"
            >
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 mb-1">Email Terkirim!</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Cek inbox <span className="font-semibold text-gray-700">{email}</span> dan ikuti link untuk reset password kamu.
              </p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 text-sm text-gold font-semibold"
            >
              ← Kembali ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
