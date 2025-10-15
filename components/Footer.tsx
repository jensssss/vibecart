export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6 mt-10 text-center text-gray-500 text-sm">
      <p>
        © {new Date().getFullYear()} <span className="text-blue-600 font-semibold">VibeCart</span>. All rights reserved.
      </p>
    </footer>
  );
}
