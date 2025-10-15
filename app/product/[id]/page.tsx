// app/product/[id]/page.tsx (Updated)

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useSession } from 'next-auth/react'; // <-- NEW: Import useSession

// Define the shape of our detailed product data, including the seller
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string | null;
  seller: {
    id: string;
    name:string;
  };
};

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const { data: session } = useSession(); // <-- NEW: Get the user's session

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false); // <-- NEW: State for button loading
  const [feedbackMessage, setFeedbackMessage] = useState(''); // <-- NEW: State for user feedback

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/products/${id}`);
          if (!res.ok) throw new Error('Product not found');
          const data = await res.json();
          setProduct(data);
        } catch (error) {
          console.error('Failed to fetch product:', error);
          setProduct(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id]);

  // <-- ENTIRE NEW FUNCTION -->
  const handleAddToCart = async () => {
    if (!session) {
      setFeedbackMessage('Please log in to add items to your cart.');
      return;
    }

    if (!product) return;

    setIsAddingToCart(true);
    setFeedbackMessage('');

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1, // Add one item at a time for now
        }),
      });

      if (res.ok) {
        setFeedbackMessage('Added to cart successfully!');
      } else {
        const errorData = await res.json();
        setFeedbackMessage(errorData.message || 'Failed to add to cart.');
      }
    } catch (error) {
      setFeedbackMessage('An unexpected error occurred.');
    } finally {
      setIsAddingToCart(false);
      // Hide the message after a few seconds
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading product details...</div>;
  }

  if (!product) {
    return <div className="text-center py-10">Product not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full rounded-lg" />
          ) : (
            <span className="text-gray-500">No Image Available</span>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
          <p className="text-3xl font-semibold text-blue-600 mb-4">{formatPrice(Number(product.price))}</p>
          <div className="mb-4">
            <span className="font-semibold">Sold by: </span>
            <Link href={`/seller/${product.seller.id}`} className="text-blue-500 hover:underline">{product.seller.name}</Link>
          </div>
          <div className="mb-4"><span className="font-semibold">Category: </span><span>{product.category}</span></div>
          <div className="mb-4"><span className="font-semibold">Stock: </span><span>{product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}</span></div>
          <p className="text-gray-700 mb-6">{product.description}</p>
          
          {/* <-- UPDATED BUTTON AND NEW FEEDBACK MESSAGE --> */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAddingToCart}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isAddingToCart ? 'Adding...' : (product.stock > 0 ? 'Add to Cart' : 'Out of Stock')}
          </button>
          {feedbackMessage && (
            <p className={`mt-4 text-center ${feedbackMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
              {feedbackMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}