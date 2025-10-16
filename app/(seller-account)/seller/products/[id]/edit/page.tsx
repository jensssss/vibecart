// app/(seller-account)/seller/products/[id]/edit/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

const initialFormState = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  imageUrl: '',
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { status } = useSession({ required: true });

  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const res = await fetch(`/api/seller/products/${id}`);
          if (!res.ok) throw new Error('Product not found');
          const data = await res.json();
          // Convert numeric values to string for the form inputs
          setFormData({
            name: data.name,
            description: data.description,
            price: String(data.price),
            stock: String(data.stock),
            category: data.category,
            imageUrl: data.imageUrl || '',
          });
        } catch (err) {
          setError('Failed to load product data.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/seller/products');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update product.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        {/* Form fields are identical to the Add Product form */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium">Product Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium">Description</label>
          <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full mt-1 p-2 border rounded-md" required></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium">Price (IDR)</label>
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required />
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium">Stock Quantity</label>
            <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required />
          </div>
        </div>
        <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium">Category</label>
            <input type="text" name="category" value={formData.category} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" required />
        </div>
        <div className="mb-6">
            <label htmlFor="imageUrl" className="block text-sm font-medium">Image URL (Optional)</label>
            <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md" />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="text-right">
          <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}