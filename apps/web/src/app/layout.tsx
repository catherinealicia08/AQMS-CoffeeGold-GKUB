import '../styles/globals.css';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Coffee Gold GKUB — Dashboard',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
