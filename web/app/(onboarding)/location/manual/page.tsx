'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { location } from '@/lib/location';

export default function ManualLocationPage() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please enter your address');
      return;
    }

    // [DECISION] No geocoding yet — latitude/longitude stay null for a
    // manually-typed address until a map/places provider is chosen. This
    // is enough for "which city/area is this customer in" style needs,
    // but not for anything requiring precise coordinates (e.g. VIP
    // service-area radius checks) — that flow will need real coordinates
    // captured some other way until geocoding is wired up.
    location.set({ address: address.trim(), latitude: null, longitude: null, source: 'manual' });
    router.push('/');
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-white px-6 py-12 md:mx-auto md:max-w-md">
      <h1 className="mb-2 font-display text-3xl font-semibold text-gray-900">Enter Your Location</h1>
      <p className="mb-8 text-gray-500">Type your address below — we&apos;ll use it to find nearby salons.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Address"
          placeholder="e.g. Bole, Addis Ababa"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          error={error ?? undefined}
        />
        <Button type="submit" className="!mt-8">
          Submit
        </Button>
      </form>

      <button onClick={() => router.push('/location')} className="mt-6 text-center font-semibold text-bloom-500">
        Use current location instead
      </button>
    </main>
  );
}
