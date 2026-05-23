'use client';

import Link from 'next/link';

export default function Error() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-6xl font-black text-gold">500</p>
      <p className="text-gray-600 text-sm">Terjadi kesalahan</p>
      <Link href="/" className="text-sm font-semibold text-gold underline">
        Kembali ke beranda
      </Link>
    </div>
  );
}
