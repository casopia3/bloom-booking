'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, Provider, Service, Specialist, Review } from '@/lib/api';

type Tab = 'info' | 'services' | 'specialists' | 'reviews';

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;

  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [providerData, servicesData, specialistsData, reviewsData] = await Promise.all([
          api.providers.getOne(providerId),
          api.providers.getServices(providerId),
          api.providers.getSpecialists(providerId),
          api.providers.getReviews(providerId),
        ]);

        setProvider(providerData);
        setServices(servicesData || []);
        setSpecialists(specialistsData || []);
        setReviews(reviewsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load provider details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [providerId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-6 py-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-gray-500">Loading provider details…</p>
        </div>
      </main>
    );
  }

  if (error || !provider) {
    return (
      <main className="min-h-screen bg-white px-6 py-8">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={() => router.back()}
            className="mb-4 text-bloom-500 hover:text-bloom-600"
          >
            ← Back
          </button>
          <p className="text-red-500">{error || 'Provider not found'}</p>
        </div>
      </main>
    );
  }

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero / Gallery */}
      <div className="relative h-64 bg-bloom-100">
        {provider.galleryImages[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={provider.galleryImages[0].url}
            alt={provider.businessName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-center font-display text-3xl text-bloom-400">{provider.businessName}</span>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute left-6 top-6 rounded-full bg-white p-2 shadow-md hover:shadow-lg"
        >
          <svg className="h-6 w-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Provider Info Header */}
      <div className="border-b border-gray-100 px-6 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold text-gray-900">{provider.businessName}</h1>
              {provider.isVerified && (
                <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  ✓ Verified
                </span>
              )}
            </div>
            {avgRating && (
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <span className="font-semibold text-gray-900">{avgRating}</span>
                  <svg className="h-5 w-5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="mt-1 text-sm text-gray-500">({reviews.length} reviews)</p>
              </div>
            )}
          </div>

          <p className="mt-4 flex items-center gap-2 text-gray-600">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                clipRule="evenodd"
              />
            </svg>
            {provider.address}
          </p>

          {provider.about && <p className="mt-3 text-gray-600">{provider.about}</p>}

          {provider.supportsVipHome && (
            <div className="mt-4 rounded-lg bg-bloom-50 p-3">
              <p className="text-sm font-medium text-bloom-600">🚗 VIP Home Service available within {provider.vipServiceRadiusKm} km</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 px-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex gap-8">
            {(['info', 'services', 'specialists', 'reviews'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-1 py-4 font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-bloom-500 text-bloom-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'info' && 'Info'}
                {tab === 'services' && `Services (${services.length})`}
                {tab === 'specialists' && `Specialists (${specialists.length})`}
                {tab === 'reviews' && `Reviews (${reviews.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-8">
        <div className="mx-auto max-w-2xl">
          {activeTab === 'info' && <InfoTab provider={provider} />}
          {activeTab === 'services' && <ServicesTab services={services} />}
          {activeTab === 'specialists' && <SpecialistsTab specialists={specialists} />}
          {activeTab === 'reviews' && <ReviewsTab reviews={reviews} />}
        </div>
      </div>
    </main>
  );
}

function InfoTab({ provider }: { provider: Provider }) {
  return (
    <div className="space-y-6">
      {provider.galleryImages.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900">Gallery</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {provider.galleryImages.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.id}
                src={img.url}
                alt="Gallery"
                className="h-32 w-full rounded-card object-cover"
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-gray-900">Hours & Location</h3>
        <p className="mt-2 text-gray-600">{provider.address}</p>
      </div>

      {provider.about && (
        <div>
          <h3 className="font-semibold text-gray-900">About</h3>
          <p className="mt-2 text-gray-600">{provider.about}</p>
        </div>
      )}
    </div>
  );
}

function ServicesTab({ services }: { services: Service[] }) {
  if (services.length === 0) {
    return <p className="text-gray-500">No services available yet</p>;
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div key={service.id} className="rounded-card border border-gray-100 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-gray-900">{service.name}</h4>
              {service.description && <p className="mt-1 text-sm text-gray-600">{service.description}</p>}
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <span>⏱ {service.durationMin} min</span>
                {service.category && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{service.category}</span>}
              </div>
            </div>
            <div className="whitespace-nowrap text-right">
              <p className="font-semibold text-gray-900">ETB {service.price.toFixed(2)}</p>
              <div className="mt-2 flex gap-1 text-xs font-medium text-gray-500">
                {service.availableStandard && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">Standard</span>}
                {service.availableVip && <span className="rounded-full bg-purple-50 px-2 py-0.5 text-purple-700">VIP</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SpecialistsTab({ specialists }: { specialists: Specialist[] }) {
  if (specialists.length === 0) {
    return <p className="text-gray-500">No specialists yet</p>;
  }

  return (
    <div className="space-y-4">
      {specialists.map((specialist) => (
        <div key={specialist.id} className="rounded-card border border-gray-100 p-4">
          <div className="flex gap-4">
            <div className="h-16 w-16 flex-shrink-0 rounded-card bg-bloom-100">
              {specialist.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={specialist.photoUrl}
                  alt={specialist.name}
                  className="h-full w-full rounded-card object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-bloom-400">{specialist.name[0]}</div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{specialist.name}</h4>
              <p className="text-sm text-gray-600">{specialist.specialty}</p>
              {specialist.bio && <p className="mt-2 text-sm text-gray-500">{specialist.bio}</p>}
              {specialist.supportsVipHome && <p className="mt-2 text-xs font-medium text-bloom-600">🚗 VIP Home Service</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewsTab({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-gray-500">No reviews yet</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-card border border-gray-100 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-gray-900">{review.customer.name}</p>
              <div className="mt-1 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? 'text-gold-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
          {review.comment && <p className="mt-3 text-sm text-gray-600">{review.comment}</p>}
        </div>
      ))}
    </div>
  );
}
