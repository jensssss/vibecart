// app/profile/page.tsx (Updated)

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils'; // We'll need this!

type Address = {
  id: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
};

type ProfileData = {
    name: string;
    email: string;
    walletBalance: number;
}

const initialAddressState = { street: '', city: '', province: '', postalCode: '' };

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState(initialAddressState);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      // Fetch both profile and addresses
      const fetchProfileData = async () => {
          const [profileRes, addressRes] = await Promise.all([
              fetch('/api/profile'),
              fetch('/api/addresses')
          ]);
          if (profileRes.ok) setProfile(await profileRes.json());
          if (addressRes.ok) setAddresses(await addressRes.json());
      };
      fetchProfileData();
    }
  }, [status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddress((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAddress),
    });
    if (res.ok) {
      const createdAddress = await res.json();
      setAddresses([createdAddress, ...addresses]);
      setNewAddress(initialAddressState);
      setShowForm(false);
    } else {
      setError('Failed to save address.');
    }
  };

  if (status === 'loading' || !profile) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {/* --- UPDATED: Account & Wallet Section --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {profile.name}</p>
            <p><span className="font-medium">Email:</span> {profile.email}</p>
            <div className="flex items-center justify-between pt-2">
                <p><span className="font-medium">Wallet Balance:</span> <span className="font-bold text-blue-600">{formatPrice(Number(profile.walletBalance))}</span></p>
                <Link href="/wallet/topup" className="bg-green-500 text-white px-4 py-2 text-sm rounded-md hover:bg-green-600">
                    Top Up
                </Link>
            </div>
        </div>
      </div>

      {/* --- Address Section (Unchanged Logic) --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Shipping Addresses</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add New Address
            </button>
          )}
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-md">
            {/* ... form inputs are unchanged ... */}
          </form>
        )}
        <div className="space-y-4">
          {addresses.length > 0 ? (
            addresses.map(addr => (
              <div key={addr.id} className="p-4 border rounded-md">
                <p className="font-semibold">{addr.street}</p>
                <p>{addr.city}, {addr.province} {addr.postalCode}</p>
              </div>
            ))
          ) : (
            !showForm && <p className="text-gray-500">You have no saved addresses.</p>
          )}
        </div>
      </div>
    </div>
  );
}