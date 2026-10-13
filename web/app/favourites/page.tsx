'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Provider } from '@/lib/api';

export default function FavouritesPage() {
  const [favourites, setFavourites] = useState<
    {
      id: string;
      serviceProviderId: string;
      createdAt: string;
      serviceProvider: Provider;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.providers
      .getFavourites()
      .then(setFavourites)
      .catch(() => {
        setError('Unable to load your favourites.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function removeFavourite(providerId: string) {
    try {
      await api.providers.removeFavourite(providerId);

      setFavourites((current) =>
        current.filter(
          (item) => item.serviceProviderId !== providerId,
        ),
      );
    } catch {
      setError('Unable to remove this favourite.');
    }
  }

  return (
    <main className="min-h-screen bg-bloom-50/30 px-4 py-6 sm:px-6 lg:pl-60">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center text-sm font-medium text-gray-500 hover:text-bloom-600"
          >
            ← Back to Home
          </Link>

          <h1 className="font-display text-2xl font-semibold text-gray-900 sm:text-3xl">
            My Favourites
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Your saved salons and beauty providers.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Loading your favourites...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && favourites.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bloom-50">
              <svg
                className="h-8 w-8 text-bloom-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
                />
              </svg>
            </div>

            <h2 className="mt-5 font-display text-lg font-semibold text-gray-900">
              No favourites yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Save your favourite salons and beauty providers so you can
              easily find them again.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl bg-bloom-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-bloom-700"
            >
              Explore Services
            </Link>
          </div>
        )}

        {/* Favourite cards */}
        {!loading && !error && favourites.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favourites.map((item) => {
              const provider = item.serviceProvider;
              const image =
                provider.galleryImages?.[0]?.url ||
                '/placeholder-salon.jpg';

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-card border border-gray-100 bg-white shadow-sm"
                >
                  <Link
                    href={`/providers/${provider.id}`}
                    className="block"
                  >
                    <div className="h-44 overflow-hidden bg-gray-100">
                      <img
                        src={image}
                        alt={provider.businessName}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </Link>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/providers/${provider.id}`}
                          className="font-display text-base font-semibold text-gray-900 hover:text-bloom-600"
                        >
                          {provider.businessName}
                        </Link>

                        <p className="mt-1 text-sm text-gray-500">
                          {provider.address || 'Addis Ababa'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFavourite(provider.id)
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bloom-50 text-bloom-600 transition hover:bg-bloom-100"
                        aria-label={`Remove ${provider.businessName} from favourites`}
                      >
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" />
                        </svg>
                      </button>
                    </div>

                    {provider.supportsVipHome && (
                      <span className="mt-3 inline-flex rounded-full bg-bloom-50 px-3 py-1 text-xs font-semibold text-bloom-600">
                        VIP Home Service
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}