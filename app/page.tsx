// app/page.tsx (Corrected)
'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Featured Products</h1>
      
      {isLoading ? (
        <p className="text-center">Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* THE FIX IS HERE ↓ */}
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}