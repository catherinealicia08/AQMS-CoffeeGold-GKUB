'use client';

import { useState } from 'react';
import { auth, db } from '@aqms/shared';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function getRegisterErrorMessage(err: unknown) {
  if (!(err instanceof FirebaseError)) return 'Registrasi gagal. Coba lagi.';

  if (err.code === 'auth/email-already-in-use') return 'Email ini sudah terdaftar.';
  if (err.code === 'auth/invalid-email') return 'Format email tidak valid.';
  if (err.code === 'auth/weak-password') return 'Password minimal 6 karakter.';
  if (err.code === 'auth/operation-not-allowed') return 'Email/password belum diaktifkan di Firebase Auth.';
  if (err.code === 'auth/unauthorized-domain') return 'Domain aplikasi belum diizinkan di Firebase Auth.';

  return `Registrasi gagal: ${err.code}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cleanName = name.trim();
      const cleanEmail = email.trim();
      const cleanPhone = phone.trim();

      const { user } = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(user, { displayName: cleanName });

      try {
        await setDoc(doc(db, 'users', user.uid), {
          phone: cleanPhone,
          displayName: cleanName,
          email: cleanEmail,
        });
      } catch (profileErr) {
        console.warn('User profile write failed:', profileErr);
      }

      router.replace('/');
    } catch (err) {
      console.warn('Register failed:', err);
      setError(getRegisterErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-cream flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gold-dark flex items-center justify-center mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <h1 className="text-xl font-black text-gold">Welcome to</h1>
          <h2 className="text-2xl font-black text-gold">Coffee Gold</h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <p className="section-label-gray mb-1.5">Full Name</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your Name"
              className="input"
            />
          </div>
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
          <div>
            <p className="section-label-gray mb-1.5">Phone Number</p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+62 8xx-xxxx-xxxx"
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
              minLength={6}
              placeholder="Min. 6 karakter"
              className="input"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold gap-2"
          >
            {loading ? 'Mendaftar...' : 'Register'}
            {!loading && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already Have An Account?{' '}
          <Link href="/login" className="text-gold font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}
