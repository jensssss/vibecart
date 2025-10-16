// components/Navbar.tsx (Updated)

'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef } from 'react'; // <-- Import useRef
import { useOnClickOutside } from '@/lib/hooks/useOnClickOutside'; // <-- Import our new hook

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // --- NEW: Create a ref for the dropdown menu ---
  const menuRef = useRef<HTMLDivElement>(null);

  // --- NEW: Use the hook to close the menu on outside click ---
  useOnClickOutside(menuRef, () => setIsMenuOpen(false));


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
            <div className="flex items-center space-x-4">
              <Link href="/cart" className="text-gray-600 hover:text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>
              {/* --- NEW: Attach the ref to the dropdown container --- */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)} // Toggle the menu
                  className="flex items-center space-x-2"
                >
                  <span className="font-medium">{session.user?.name}</span>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                    <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-blue-600">Log In</Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}