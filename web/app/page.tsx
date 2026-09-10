'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api, Provider } from '@/lib/api';
import { location } from '@/lib/location';
import { ProviderCard } from '@/components/ui/ProviderCard';

// Still a fixed list rather than pulled from the backend (there's no
// "list all categories in use" endpoint) — but selecting one now sends a
// real ?category= query and actually filters results, unlike before.
const CATEGORIES = ['All', 'Spa', 'Haircut', 'Coloring', 'Manicure'];

export default function HomePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/sign-in');
      return;
    }
    setChecked(true);
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!checked) return;

    setIsLoading(true);
    setError(null);

    const savedLocation = location.get();

    api.providers
      .list({
        search: debouncedSearch || undefined,
        category: activeCategory === 'All' ? undefined : activeCategory,
        lat: savedLocation?.latitude ?? undefined,
        lng: savedLocation?.longitude ?? undefined,
      })
      .then(setProviders)
      .catch(() => setError('Could not load salons right now. Please try again.'))
      .finally(() => setIsLoading(false));
  }, [checked, debouncedSearch, activeCategory]);

  if (!checked) return null;

  return (
    <main className="min-h-screen bg-white pb-12">
      <div className="rounded-b-[32px] bg-bloom-100 px-6 pb-8 pt-10">
        <h1 className="font-display text-2xl font-semibold text-gray-900">Hello, Bloom 👋</h1>
        <p className="mt-1 text-gray-600">Find your next salon experience</p>

        <div className="mt-6">
          <input
            type="text"
            placeholder="Find spa, salon, products"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-button border-none bg-white px-5 py-3.5 text-base shadow-sm outline-none"
          />
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap rounded-button px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat ? 'bg-bloom-500 text-white' : 'bg-white text-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-8">
        <h2 className="mb-4 font-display text-xl font-semibold text-gray-900">
          {location.get()?.latitude != null ? 'Nearest to you' : 'All salons'}
        </h2>

        {isLoading && <p className="text-gray-500">Loading salons…</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && providers.length === 0 && (
          <p className="text-gray-500">No salons match your search — try a different category or search term.</p>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      </div>
    </main>
  );
}
