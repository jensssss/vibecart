// app/wallet/topup/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';

export default function TopUpPage() {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback({ message: '', type: '' });

    const res = await fetch('/api/wallet/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount) }),
    });

    const data = await res.json();

    if (res.ok) {
      setFeedback({ message: `Success! Your new balance is ${formatPrice(Number(data.newBalance))}.`, type: 'success' });
      setTimeout(() => router.push('/profile'), 2000); // Redirect after 2s
    } else {
      setFeedback({ message: data.message || 'Top-up failed.', type: 'error' });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">Top Up Your Wallet</h1>
        <p className="text-center text-gray-600">This is a mock top-up. No real payment is required.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (IDR)</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 500000"
              required
              max="10000000"
            />
          </div>
          {feedback.message && (
            <p className={`text-sm text-center ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {feedback.message}
            </p>
          )}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? 'Processing...' : 'Add Funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}