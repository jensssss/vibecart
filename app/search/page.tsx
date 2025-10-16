// app/search/page.tsx

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
};

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      const fetchProducts = async () => {
        try {
          const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setProducts(data);
          }
        } catch (error) {
          console.error('Failed to fetch search results:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProducts();
    } else {
        setIsLoading(false);
        setProducts([]);
    }
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading ? (
        <p className="text-center">Searching...</p>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6">
            {products.length > 0
              ? `Search results for "${query}"`
              : `No results found for "${query}"`}
          </h1>
          {products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Wrap the component in Suspense for client-side search parameter reading
export default function SearchPage() {
    return (
        <Suspense fallback={<div className="text-center py-10">Loading search...</div>}>
            <SearchResults />
        </Suspense>
    )
}