// app/(seller-account)/seller/orders/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { OrderStatus } from '@prisma/client';

// Define the shape of our detailed order data
type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  totalAmount: number;
  buyer: { name: string };
  items: {
    quantity: number;
    product: { name: string };
  }[];
};

export default function SellerOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && session.user.role !== 'seller') router.push('/');
    if (status === 'authenticated' && session.user.role === 'seller') {
      fetchOrders();
    }
  }, [status, session, router]);
  
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/seller/orders');
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/seller/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // Update the local state to reflect the change instantly
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        alert('Failed to update status.');
      }
    } catch (error) {
      alert('An error occurred.');
    }
  };

  if (isLoading || status === 'loading') {
    return <div className="text-center py-10">Loading orders...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {orders.length === 0 ? (
          <p>You have no orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-bold">Order #{order.id.substring(0, 8)}</h2>
                    <p className="text-sm text-gray-500">
                      Buyer: {order.buyer.name} | {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                     <p className="font-bold text-lg">{formatPrice(Number(order.totalAmount))}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-sm">Items:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {order.items.map(item => (
                      <li key={item.product.name}>{item.product.name} (Qty: {item.quantity})</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm font-medium">Status: <span className="font-bold">{order.status}</span></p>
                    <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="border rounded p-1"
                    >
                        <option value="PENDING">Pending</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}