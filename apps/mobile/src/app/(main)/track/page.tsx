'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AppHeader from '@/components/AppHeader';
import TrackContent from './TrackContent';

export default function TrackPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      <AppHeader />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gold/50 text-sm">Memuat...</div>}>
        <TrackContentWrapper />
      </Suspense>
    </div>
  );
}

function TrackContentWrapper() {
  const params = useSearchParams();
  const orderId = params.get('orderId');
  return <TrackContent orderId={orderId} />;
}
