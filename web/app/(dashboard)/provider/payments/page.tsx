'use client';

import { useEffect, useState } from 'react';
import { api, Provider } from '@/lib/api';

export default function PaymentsPage() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.providers
      .getMine()
      .then(setProvider)
      .catch(() => setError('Could not load payment information right now.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p className="text-gray-500">Loading…</p>;
  if (error || !provider) return <p className="text-red-500">{error ?? 'Something went wrong.'}</p>;

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 rounded-card bg-bloom-100 px-5 py-4">
        <h1 className="font-display text-xl font-bold text-bloom-700">Payments</h1>
      </div>

      <div className="mb-4 rounded-card bg-bloom-50 p-5">
        <p className="text-sm text-gray-500">Platform Commission Rate</p>
        <p className="mt-1 font-display text-2xl font-bold text-bloom-700">{provider.commissionRate}%</p>
      </div>

      <div className="rounded-card bg-bloom-50 p-5">
        <p className="font-display font-semibold text-bloom-700">Payout Account</p>
        <p className="mt-2 text-sm text-gray-500">
          Setting up a payout account for receiving customer payments isn&apos;t available yet — this is coming in a
          future update.
        </p>
      </div>
    </div>
  );
}