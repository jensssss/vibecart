// app/product/[id]/page.tsx (Updated)

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

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
    name: string;
  };
};

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const { data: session } = useSession();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [quantity, setQuantity] = useState(1); // <-- NEW: State for quantity

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
          quantity: quantity, // <-- UPDATED: Use the quantity state
        }),
      });
      if (res.ok) {
        setFeedbackMessage(`${quantity} item(s) added to cart successfully!`);
      } else {
        const errorData = await res.json();
        setFeedbackMessage(errorData.message || 'Failed to add to cart.');
      }
    } catch (error) {
      setFeedbackMessage('An unexpected error occurred.');
    } finally {
      setIsAddingToCart(false);
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading product details...</div>;
  }

  if (!product) {
    return <div className="text-center py-10">Product not found.</div>;
  }

  // --- NEW: Functions to handle quantity changes ---
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
        setQuantity(newQuantity);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-cover w-full h-full rounded-lg"
            />
          ) : (
            <span className="text-gray-500">No Image Available</span>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
          <p className="text-3xl font-semibold text-blue-600 mb-4">
            {formatPrice(Number(product.price))}
          </p>
          <div className="mb-4">
            <span className="font-semibold">Sold by: </span>
            <Link href={`/seller/${product.seller.id}`} className="text-blue-500 hover:underline">
              {product.seller.name}
            </Link>
          </div>
          <div className="mb-4">
            <span className="font-semibold">Category: </span>
            <span>{product.category}</span>
          </div>
          <div className="mb-4">
            <span className="font-semibold">Stock: </span>
            <span>{product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}</span>
          </div>
          <p className="text-gray-700 mb-6">{product.description}</p>
          
          {/* --- NEW: Quantity Selector --- */}
          <div className="flex items-center space-x-4 mb-6">
            <label htmlFor="quantity" className="font-semibold text-gray-700">Quantity:</label>
            <div className="flex items-center border border-gray-300 rounded-md">
              <button onClick={() => handleQuantityChange(quantity - 1)} className="px-4 py-2 text-lg font-bold hover:bg-gray-100 rounded-l-md disabled:opacity-50" disabled={quantity <= 1}>-</button>
              <input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                className="w-16 text-center border-l border-r focus:outline-none"
                min="1"
                max={product.stock}
              />
              <button onClick={() => handleQuantityChange(quantity + 1)} className="px-4 py-2 text-lg font-bold hover:bg-gray-100 rounded-r-md disabled:opacity-50" disabled={quantity >= product.stock}>+</button>
            </div>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAddingToCart}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isAddingToCart ? 'Adding...' : (product.stock > 0 ? `Add ${quantity} to Cart` : 'Out of Stock')}
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