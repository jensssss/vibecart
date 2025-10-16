// app/orders/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

// Define the shape of our order data
type Order = {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  items: {
    product: {
      id: string;
      name: string;
      imageUrl?: string | null;
    };
  }[];
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      const fetchOrders = async () => {
        try {
          const res = await fetch('/api/orders');
          if (res.ok) {
            const data = await res.json();
            setOrders(data);
          }
        } catch (error) {
          console.error('Failed to fetch orders:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrders();
    }
  }, [status, router]);

  if (isLoading || status === 'loading') {
    return <div className="text-center py-10">Loading your orders...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">You haven't placed any orders yet.</p>
          <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="font-semibold text-lg">Order #{order.id.substring(0, 8)}</h2>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatPrice(Number(order.totalAmount))}</p>
                  <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {order.status}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="flex space-x-4">
                  {order.items.map(item => (
                     <div key={item.product.id} className="w-16 h-16 bg-gray-200 rounded-md">
                        {item.product.imageUrl && (
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover rounded-md" />
                        )}
                     </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}