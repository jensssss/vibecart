// app/cart/page.tsx (Corrected)

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

// Define the shape of our cart item data
type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
    stock: number;
  };
};

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if user is not logged in
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (status === 'authenticated') {
      const fetchCartItems = async () => {
        try {
          const res = await fetch('/api/cart');
          if (res.ok) {
            const data = await res.json();
            setCartItems(data);
          }
        } catch (error) {
          console.error('Failed to fetch cart items:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCartItems();
    }
  }, [status, router]);

  // Calculate the total price
  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return total + Number(item.product.price) * item.quantity;
    }, 0);
  }, [cartItems]);

  if (isLoading || status === 'loading') {
    return <div className="text-center py-10">Loading your cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center bg-white p-4 border rounded-lg">
                <div className="w-24 h-24 bg-gray-200 rounded-md mr-4">
                  {item.product.imageUrl && (
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover rounded-md" />
                  )}
                </div>
                <div className="flex-grow">
                  <h2 className="font-semibold">{item.product.name}</h2>
                  <p className="text-sm text-gray-500">{formatPrice(Number(item.product.price))}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span>Qty: {item.quantity}</span>
                  {/* We can add update/remove buttons later */}
                </div>
                <div className="font-bold ml-auto">
                  {formatPrice(Number(item.product.price) * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white p-6 border rounded-lg">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            {/* --- THIS IS THE FIX --- */}
            <Link 
              href="/checkout" 
              className="block text-center w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}