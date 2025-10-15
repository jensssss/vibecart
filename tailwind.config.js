/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { // <-- Corrected key
    extend: {
      colors: {
        primary: "#2563eb", // Blue
        accent: "#3b82f6",
        background: "#f9fafb",
        card: "#ffffff",
        text: "#111827",
      },
    },
  },
  plugins: [],
};