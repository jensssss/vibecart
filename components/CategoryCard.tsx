export default function CategoryCard({ name }: { name: string }) {
  return (
    <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-xl font-medium hover:bg-blue-600 hover:text-white transition">
      {name}
    </button>
  );
}
