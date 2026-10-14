'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api, Provider, Promotion } from '@/lib/api';
import { location } from '@/lib/location';
import { Navigation } from '@/components/ui/Navigation';
import { ProviderCard } from '@/components/ui/ProviderCard';
import { Button } from '@/components/ui/Button';

const CATEGORIES = ['All', 'Spa', 'Haircut', 'Coloring', 'Manicure'];

export default function HomePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [showLanding, setShowLanding] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationVersion, setLocationVersion] = useState(0);
  const handleGetCurrentLocation = () => {
  if (!navigator.geolocation) {
    setLocationError('Location is not supported by this browser.');
    return;
  }

  setIsGettingLocation(true);
  setLocationError(null);

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = Number(position.coords.latitude.toFixed(6));
      const longitude = Number(position.coords.longitude.toFixed(6));

      location.set({
        address: 'Current location',
        latitude,
        longitude,
        source: 'gps',
      });

      setLocationLabel('Current location');
      setLocationVersion((version) => version + 1);
      setIsGettingLocation(false);
    },
    (error) => {
      setIsGettingLocation(false);

      if (error.code === error.PERMISSION_DENIED) {
        setLocationError(
          'Location permission was denied. Please allow location access in your browser.',
        );
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        setLocationError(
          'Your current location could not be determined.',
        );
      } else if (error.code === error.TIMEOUT) {
        setLocationError(
          'Getting your location took too long. Please try again.',
        );
      } else {
        setLocationError('Could not get your current location.');
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    },
  );
};
  useEffect(() => {
    if (!auth.isAuthenticated()) {
      // Previously: router.push('/sign-in'). Now: render the Landing
      // page below instead — the only change in this effect. Every
      // authenticated role branch beneath this is untouched.
      setShowLanding(true);
      return;
    }

    // A provider-admin, specialist, or super-admin landing on '/' should
    // never see the customer browse page — that was the gap: only the nav
    // links were role-aware before, not the page content itself.
    const role = auth.getRole();
    if (role === 'PROVIDER_ADMIN') {
      router.push('/provider/bookings');
      return;
    }
    if (role === 'SPECIALIST') {
      router.push('/specialist/appointments');
      return;
    }
    if (role === 'SUPER_ADMIN') {
      router.push('/admin');
      return;
    }

    setChecked(true);
  }, [router]);

  useEffect(() => {
    const saved = location.get();
    setLocationLabel(saved?.address ?? null);
  }, []);
  useEffect(() => {
  if (!checked) return;

  api.promotions
    .findAll()
    .then((promotions) => {
      const activePromotion = promotions
        .filter((item) => item.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)[0] ?? null;

      setPromotion(activePromotion);
    })
    .catch(() => {
      setPromotion(null);
    });
}, [checked]);

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
 }, [checked, debouncedSearch, activeCategory, locationVersion]);


if (showLanding) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#F8F4FC] via-white to-[#EDE3F8] px-6 py-10 text-center">

      {/* Subtle decorative shapes */}
      <div className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />

      {/* Main content */}
      <div className="relative z-10 flex w-full max-w-xl flex-col items-center">

        {/* Bloom logo */}
        <img
          src="/bloom-logo.png"
          alt="Bloom App — Salon and Spa Booking"
          className="bloom-logo-hover h-28 w-auto object-contain sm:h-36"
        />

        {/* Headline */}

{/* Headline */}

<h1 className="bloom-headline mt-8 max-w-lg font-display text-xl font-bold leading-tight tracking-tight text-bloom-700 sm:mt-10 sm:text-3xl">
  Effortless Booking, Exquisite Experiences!
</h1>


        {/* Customer and service provider entry points */}
        <div className="mt-9 flex w-full max-w-sm flex-col gap-4 sm:mt-10">

          <Button onClick={() => router.push('/sign-up')}>
            Find Salons &amp; Spa Services
          </Button>
<Button
  variant="secondary"
  onClick={() => router.push('/provider-application')}
>
  Register Your Salon &amp; Spa Business
</Button>
        </div>

        {/* Existing user sign-in */}
        <p className="mt-8 text-sm text-gray-500 sm:text-base">
          Already have an account?{' '}
          <a
            href="/sign-in"
            className="font-semibold text-bloom-600 underline-offset-4 transition-colors hover:text-bloom-700 hover:underline"
          >
            Sign in
          </a>
        </p>

        {/* Footer tagline */}
        <p className="mt-14 text-xs tracking-wide text-gray-400 sm:mt-16 sm:text-sm">
          Beauty, wellness, and self-care — made simple.
        </p>

      </div>
    </main>
  );
}


  if (!checked) return null;

  return (
    <>
      <Navigation notificationCount={0} />

      <main className="min-h-screen bg-bloom-50/40 pb-8 sm:pb-12 lg:pl-60">
   {/* Desktop Welcome + Search + Categories */}
<div className="hidden lg:block border-b border-bloom-100 bg-bloom-50">
  <div className="mx-auto max-w-7xl px-10 py-6">

    {/* Welcome header */}
    <div className="flex items-start justify-between gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-900">
          Hello, Bloom
        </h1>

        {locationLabel ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <svg
              className="h-4 w-4 text-bloom-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 21.5a2 2 0 01-2.828 0l-4.243-4.843a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>

            <span>{locationLabel}</span>
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            Find your next salon experience
          </p>
        )}
      </div>


    </div>

    {/* Desktop search */}
    <div className="mt-5">
      <div className="relative max-w-4xl">
        <svg
         className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35m2.1-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
          />
        </svg>

        <input
          type="text"
          placeholder="Find spa, salon, products"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
         className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-14 pr-5 text-base text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-bloom-400 focus:ring-4 focus:ring-bloom-100"
        />
      </div>
    </div>

    {/* Desktop categories */}
    <div className="mt-5">
      <p className="mb-3 text-sm font-semibold text-gray-900">
        Categories
      </p>

      <div className="flex gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              activeCategory === cat
                ? 'bg-bloom-500 text-white shadow-sm'
                : 'border border-gray-200 bg-white text-gray-700 hover:border-bloom-300 hover:text-bloom-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>

  </div>
</div>

{/* Mobile Welcome + Search + Categories */}
<div className="lg:hidden rounded-b-[32px] bg-bloom-100 px-6 pb-8 pt-6 sm:pt-10">
  <div className="mx-auto max-w-6xl">

    <div className="flex items-start justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold text-gray-900">
          Hello, Bloom
        </h1>

        {locationLabel ? (
          <p className="mt-1 flex items-center gap-1 text-gray-600">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 21.5a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>

            {locationLabel}
          </p>
        ) : (
          <p className="mt-1 text-gray-600">
            Find your next salon experience
          </p>
        )}
      </div>
    </div>

    {/* Mobile search */}
    <div className="mt-6">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35m2.1-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
          />
        </svg>

        <input
          type="text"
          placeholder="Find spa, salon, products"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-button border-none bg-white py-3.5 pl-11 pr-5 text-base shadow-sm outline-none"
        />
      </div>
    </div>

    {/* Mobile categories */}
    <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={`whitespace-nowrap rounded-button px-4 py-2 text-sm font-medium transition-colors ${
            activeCategory === cat
              ? 'bg-bloom-500 text-white'
              : 'bg-white text-gray-700'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>

  </div>
</div>

        <div className="mx-auto max-w-6xl px-6 pt-8">
{/* Promo banner */}
{promotion && (
<div className="relative mb-8 min-h-[170px] overflow-hidden rounded-card bg-gradient-to-br from-bloom-700 to-bloom-500 px-8 py-6 sm:min-h-[190px] sm:py-7">
    <div className="relative z-20 max-w-lg">
      <p className="font-display text-xl font-semibold text-white sm:text-2xl">
        {promotion.title}
      </p>

      {promotion.description && (
       <p className="mt-1 text-sm leading-5 text-white/80">
          {promotion.description}
        </p>
      )}

      {promotion.discount && (
        <p className="mt-3 text-2xl font-bold text-white">
          {promotion.discount}% OFF
        </p>
      )}

      {promotion.buttonText && (
        <button
          onClick={() => setActiveCategory('All')}
          className="mt-5 inline-flex items-center gap-2 rounded-button bg-white px-5 py-2.5 text-sm font-semibold text-bloom-600 transition-colors hover:bg-bloom-50"
        >
          {promotion.buttonText}

          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>
      )}
    </div>

    {promotion.imageUrl && (
      <img
        src={promotion.imageUrl}
        alt=""
        className="pointer-events-none absolute right-0 top-0 z-10 h-full w-[46%] object-cover opacity-90"
      />
    )}

    <div className="pointer-events-none absolute -bottom-10 -right-6 z-10 h-40 w-40 rounded-full bg-white/10 sm:h-56 sm:w-56" />

    <div className="pointer-events-none absolute right-16 top-4 z-10 h-16 w-16 rounded-full bg-white/10" />
  </div>
)}

          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-gray-900">
              {locationLabel ? (
                <>
                  <svg className="h-5 w-5 text-bloom-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                  </svg>
                  Nearest to you
                </>
              ) : (
                'All salons'
              )}
            </h2>
          </div>

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
    </>
  );
}
