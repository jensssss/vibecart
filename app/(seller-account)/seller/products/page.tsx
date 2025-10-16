// app/(seller-account)/seller/products/page.tsx (Updated)

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
};

export default function SellerProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ... (useEffect hook is unchanged) ...
    if (status === 'unauthenticated') router.push('/login');
    else if (status === 'authenticated' && session.user.role !== 'seller') router.push('/');
    if (status === 'authenticated') fetchProducts();
  }, [status, session, router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/seller/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW: Function to handle deleting a product ---
  const handleDelete = async (productId: string) => {
    // Add a confirmation dialog for safety
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // If successful, remove the product from the local state to update the UI
        setProducts(products.filter(p => p.id !== productId));
      } else {
        alert('Failed to delete product.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the product.');
    }
  };

  if (isLoading || status === 'loading') {
    return <div className="text-center py-10">Loading your products...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Link href="/seller/products/add" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Add New Product
        </Link>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {products.length === 0 ? (
          <p>You haven't added any products yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatPrice(Number(product.price))}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <Link href={`/seller/products/${product.id}/edit`} className="text-blue-600 hover:text-blue-900">
                      Edit
                    </Link>
                    {/* --- NEW: Delete button --- */}
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}