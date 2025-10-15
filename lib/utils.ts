// lib/utils.ts

// Function to format a number into Indonesian Rupiah currency format
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price * 15000);
};