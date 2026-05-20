'use client';

import { useEffect, useState } from 'react';
import { useQueueDisplay } from '@/hooks/useQueueDisplay';

function Clock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    function update() {
      setTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return <span>{time}</span>;
}

export default function DisplayPage() {
  const { preparing, ready } = useQueueDisplay();

  // Fill preparing grid to always show 9 cells
  const preparingGrid = Array.from({ length: 9 }).map((_, i) => preparing[i] ?? null);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAF6EE' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#6B4F0A' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-black text-gold" style={{ color: '#6B4F0A' }}>COFFEE GOLD GKUB</p>
            <p className="text-[10px] text-gray-400 tracking-widest">QUEUE MANAGEMENT SYSTEM</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold tracking-widest text-gold" style={{ color: '#8B6914' }}>QUEUE MONITOR</p>
          <p className="text-[10px] text-gray-400">Lobby A1</p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 grid grid-cols-2 gap-8 px-10 pb-6">
        {/* Left — Sedang Disiapkan */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <h2 className="font-bold text-gray-800">Sedang Disiapkan</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {preparingGrid.map((entry, i) => (
              <div
                key={entry?.id ?? `empty-${i}`}
                className={`aspect-square flex items-center justify-center rounded-2xl border-2 transition-all ${
                  entry
                    ? 'bg-white border-gold/20 shadow-sm'
                    : 'bg-transparent border-dashed border-gray-200'
                }`}
              >
                {entry && (
                  <span className="text-4xl font-black" style={{ color: '#8B6914' }}>
                    {entry.queue_number}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Right — Siap Diambil */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <h2 className="font-bold text-gray-800">Siap Diambil</h2>
          </div>

          <div className="flex flex-col gap-3">
            {ready.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <p className="text-sm text-gray-300 italic">Belum ada pesanan siap</p>
              </div>
            ) : (
              ready.map((entry, i) => (
                <div
                  key={entry.id}
                  className={`flex items-center px-6 py-4 rounded-2xl ${
                    i === 0 ? 'animate-pulse-once' : ''
                  }`}
                  style={{ backgroundColor: '#C19A38' }}
                >
                  <span className="text-4xl font-black text-white">{entry.queue_number}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Footer ticker */}
      <footer
        className="flex items-center justify-between px-10 py-4"
        style={{ backgroundColor: '#6B4F0A' }}
      >
        <div className="flex items-center gap-3 text-white">
          <div className="w-1 h-6 bg-white/40 rounded-full" />
          <p className="text-sm">
            Nikmati Kopi Anda di{' '}
            <span className="font-semibold text-gold-200" style={{ color: '#D4AE50' }}>
              Luar Area Konter
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-white/80">
          <div className="text-right">
            <p className="text-[10px] tracking-widest opacity-60">WAKTU SEKARANG</p>
            <p className="text-xl font-black">
              <Clock />
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
            </svg>
          </div>
        </div>
      </footer>
    </div>
  );
}
