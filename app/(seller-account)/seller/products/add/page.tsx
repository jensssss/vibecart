// app/(seller-account)/seller/products/add/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const initialFormState = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  imageUrl: '',
};

export default function AddProductPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Product created successfully, redirect to the product list page
        router.push('/seller/products');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create product.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent non-sellers from accessing the page
  if (status === 'authenticated' && session.user.role !== 'seller') {
      router.push('/');
      return null;
  }

  if (status === 'loading') {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add a New Product</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" id="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full mt-1 p-2 border rounded-md" required></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (IDR)</label>
            <input type="number" name="price" id="price" value={formData.price} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" placeholder="e.g., 150000" required />
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
            <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required />
          </div>
        </div>
        <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <input type="text" name="category" id="category" value={formData.category} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" placeholder="e.g., Electronics, Apparel" required />
        </div>
        <div className="mb-6">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
            <input type="text" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" placeholder="https://..." />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="text-right">
          <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
            {isLoading ? 'Saving...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}