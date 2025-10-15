// app/profile/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Define the shape of our address data
type Address = {
  id: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
};

const initialAddressState = {
  street: '',
  city: '',
  province: '',
  postalCode: '',
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState(initialAddressState);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (status === 'authenticated') {
      const fetchAddresses = async () => {
        const res = await fetch('/api/addresses');
        if (res.ok) {
          const data = await res.json();
          setAddresses(data);
        }
      };
      fetchAddresses();
    }
  }, [status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress((prevState) => ({ ...prevState, [name]: value }));
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
      setAddresses([createdAddress, ...addresses]); // Add to top of the list
      setNewAddress(initialAddressState); // Reset form
      setShowForm(false); // Hide form
    } else {
      const data = await res.json();
      setError(data.message || 'Failed to save address.');
    }
  };

  if (status === 'loading') {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-2">Account Information</h2>
        <p><span className="font-medium">Name:</span> {session?.user?.name}</p>
        <p><span className="font-medium">Email:</span> {session?.user?.email}</p>
      </div>

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
            <h3 className="text-lg font-medium">New Address Form</h3>
            <div>
              <label className="block text-sm font-medium">Street</label>
              <input type="text" name="street" value={newAddress.street} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">City</label>
                <input type="text" name="city" value={newAddress.city} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium">Province</label>
                <input type="text" name="province" value={newAddress.province} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Postal Code</label>
              <input type="text" name="postalCode" value={newAddress.postalCode} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded-md">Cancel</button>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Save Address</button>
            </div>
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