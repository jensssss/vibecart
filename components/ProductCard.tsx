// components/ProductCard.tsx (Updated)
import Link from 'next/link';
import { formatPrice } from '@/lib/utils'; // <-- IMPORT the function

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.id}`} className="group block overflow-hidden border rounded-lg">
      <div className="relative h-[300px]">
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
            ) : (
                <span className="text-gray-500">No Image</span>
            )}
        </div>
      </div>
      <div className="p-4 bg-white">
        <h3 className="text-md font-semibold text-gray-800 group-hover:underline">
          {product.name}
        </h3>
        <p className="mt-2 text-lg font-bold text-blue-600">
          {/* The function call itself doesn't change, just where it comes from */}
          {formatPrice(Number(product.price))}
        </p>
      </div>
    </Link>
  );
}