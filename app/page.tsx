import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const categories = ["Electronics", "Fashion", "Home", "Toys", "Beauty"];

  return (
    <div className="max-w-7xl mx-auto mt-6">
      {/* Hero Section */}
      <section className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-600">
          Shop the Vibe ✨
        </h1>
        <p className="text-gray-600">
          Discover products from sellers across Indonesia.
        </p>
      </section>

      {/* Category Section */}
      <section className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map((cat) => (
          <CategoryCard key={cat} name={cat} />
        ))}
      </section>

      {/* Product Feed */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCard key={i} />
        ))}
      </section>
    </div>
  );
}
