'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { location } from '@/lib/location';

export default function LocationPage() {
  const router = useRouter();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAllowLocation() {
    if (!navigator.geolocation) {
      setError('Location services are not available on this browser.');
      return;
    }

    setIsRequesting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // No reverse-geocoding yet (needs a map/places API decision — see
        // lib/location.ts) — we store real coordinates now and a
        // placeholder label; the address text can be upgraded once a
        // provider is chosen.
        location.set({
          address: 'Current location',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          source: 'gps',
        });
        setIsRequesting(false);
        router.push('/');
      },
      () => {
        setIsRequesting(false);
        setError('Could not access your location. Please allow location access or enter it manually.');
      },
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 text-center md:mx-auto md:max-w-md">
      <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-bloom-100">
        <svg className="h-16 w-16 text-bloom-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>

      <h1 className="mb-2 font-display text-3xl font-semibold text-gray-900">What is your location</h1>
      <p className="mb-8 text-gray-500">We need to know your location in order to suggest nearby service.</p>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <Button onClick={handleAllowLocation} isLoading={isRequesting} className="mb-4">
        Allow Location Access
      </Button>

      <button onClick={() => router.push('/location/manual')} className="font-semibold text-bloom-500">
        Enter Location Manually
      </button>
    </main>
  );
}
