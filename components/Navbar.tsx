// components/Navbar.tsx

'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 'loading' status is when NextAuth is checking the session
  if (status === 'loading') {
    return (
        <header className="bg-white shadow-sm">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="text-2xl font-bold text-blue-600">VibeCart</div>
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            </nav>
        </header>
    );
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          VibeCart
        </Link>
        <div className="flex items-center space-x-4">
          {session ? (
            // Logged-in user view
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2"
              >
                <span className="font-medium">{session.user?.name}</span>
                {/* Simple avatar placeholder */}
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {session.user?.name?.charAt(0).toUpperCase()}
                </div>
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                   <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Guest view
            <>
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}