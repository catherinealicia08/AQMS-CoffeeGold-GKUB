import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { CartSheetProvider } from '@/context/CartSheetContext';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

export const metadata: Metadata = {
  title: 'Coffee Gold GKUB',
  description: 'Order your coffee and track your queue',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CoffeeGold',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#8B6914',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={manrope.className}>
        <AuthProvider>
          <CartProvider>
            <CartSheetProvider>
              {children}
            </CartSheetProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
