// app/layout.tsx (Updated)

import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import Navbar from '@/components/Navbar'; // 1. Import the Navbar

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VibeCart',
  description: 'A modern multi-seller marketplace.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <AuthProvider>
          <Navbar /> {/* 2. Add it here */}
          <main>{children}</main> {/* Optional: wrap children in a main tag */}
        </AuthProvider>
      </body>
    </html>
  );
}