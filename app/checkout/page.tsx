// app/checkout/page.tsx

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';

// Define types for our data
type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
  };
};

type Address = {
  id: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
};

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (status === 'authenticated') {
      const fetchData = async () => {
        try {
          // Fetch both cart and addresses in parallel
          const [cartRes, addressRes] = await Promise.all([
            fetch('/api/cart'),
            fetch('/api/addresses'),
          ]);

          if (!cartRes.ok || !addressRes.ok) {
            throw new Error('Failed to fetch checkout data.');
          }

          const cartData = await cartRes.json();
          const addressData = await addressRes.json();

          if (cartData.length === 0) {
            // Redirect to cart page if cart is empty
            router.push('/cart');
            return;
          }

          setCartItems(cartData);
          setAddresses(addressData);
          // Pre-select the first address by default
          if (addressData.length > 0) {
            setSelectedAddress(addressData[0].id);
          }

        } catch (err) {
          setError('Could not load checkout. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [status, router]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0);
  }, [cartItems]);

  const handlePlaceOrder = async () => {
    // We will build this logic in the next step!
    alert('Order placement logic is not yet implemented.');
  };

  if (isLoading || status === 'loading') {
    return <div className="text-center py-10">Loading checkout...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Address Selection */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            {addresses.length > 0 ? (
              <div className="space-y-4">
                {addresses.map(addr => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr.id)}
                    className={`p-4 border rounded-lg cursor-pointer ${selectedAddress === addr.id ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}
                  >
                    <p className="font-semibold">{addr.street}</p>
                    <p>{addr.city}, {addr.province} {addr.postalCode}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>You have no saved addresses. Please <a href="/profile" className="text-blue-600 underline">add one</a>.</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>{formatPrice(Number(item.product.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <hr className="my-4" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={!selectedAddress || cartItems.length === 0}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              Place Order
            </button>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}