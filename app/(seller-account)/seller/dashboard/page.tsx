// app/seller/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

// Define the shape of our stats data
type SellerStats = {
  totalRevenue: number;
  totalOrders: number;
  productsSold: number;
};

export default function SellerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Protect the route: redirect if not logged in or not a seller
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session.user.role !== 'seller') {
      router.push('/'); // Redirect non-sellers to the homepage
    }

    if (status === 'authenticated' && session.user.role === 'seller') {
      const fetchStats = async () => {
        try {
          const res = await fetch('/api/seller/dashboard');
          if (res.ok) {
            const data = await res.json();
            setStats(data);
          }
        } catch (error) {
          console.error('Failed to fetch seller stats:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchStats();
    }
  }, [status, session, router]);

  if (isLoading || status === 'loading') {
    return <div className="text-center py-10">Loading Dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium">Total Revenue</h2>
          <p className="text-3xl font-bold">{formatPrice(Number(stats?.totalRevenue) || 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium">Total Orders</h2>
          <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium">Active Products</h2>
          <p className="text-3xl font-bold">{stats?.productsSold || 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex space-x-4">
            <Link href="/seller/products" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Manage Products
            </Link>
            <Link href="/seller/orders" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                View Orders
            </Link>
          </div>
      </div>
    </div>
  );
}