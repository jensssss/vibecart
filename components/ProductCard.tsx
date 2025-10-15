export default function ProductCard() {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 hover:-translate-y-1 hover:shadow-lg transition">
      <div className="aspect-square bg-gray-100 rounded-lg mb-3"></div>
      <h3 className="font-semibold text-lg">Sample Product</h3>
      <p className="text-gray-600 text-sm mb-2">by SellerName</p>
      <p className="text-blue-600 font-semibold mb-3">Rp 120.000</p>
      <button className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition">
        Add to Cart
      </button>
    </div>
  );
}
