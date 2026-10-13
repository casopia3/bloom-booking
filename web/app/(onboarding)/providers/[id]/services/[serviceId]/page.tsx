'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ServiceDetail, Provider } from '@/lib/api';
import { Navigation } from '@/components/ui/Navigation';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;
  const serviceId = params.serviceId as string;

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.services.getOne(serviceId), api.providers.getOne(providerId)])
      .then(([serviceData, providerData]) => {
        setService(serviceData);
        setProvider(providerData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load this service'))
      .finally(() => setLoading(false));
  }, [serviceId, providerId]);

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-bloom-200 border-t-bloom-500" />
        </main>
      </>
    );
  }

  if (error || !service || !provider) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-white px-6 py-8">
          <div className="mx-auto max-w-2xl rounded-card border border-red-100 bg-red-50 p-6">
            <p className="text-red-700 font-medium">{error || 'Service not found'}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <button
            onClick={() => router.push(`/providers/${providerId}`)}
            className="mb-6 inline-flex items-center gap-2 text-bloom-600 hover:text-bloom-700 font-medium transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {provider.businessName}
          </button>

          <div className="rounded-card border border-gray-100 overflow-hidden mb-6">
            {service.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={service.imageUrl} alt={service.name} className="h-56 w-full object-cover" />
            ) : (
              <div className="h-56 w-full bg-gradient-to-br from-bloom-100 to-bloom-50 flex items-center justify-center">
                <span className="font-display text-2xl text-bloom-400">{service.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="font-display text-2xl font-bold text-gray-900">{service.name}</h1>
            <p className="text-2xl font-bold text-bloom-600 whitespace-nowrap">
              ETB {Number(service.price).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
              ⏱️ {service.durationMin} min
            </span>
            {service.category && (
              <span className="text-sm font-medium text-bloom-700 bg-bloom-50 px-3 py-1 rounded-full">
                {service.category}
              </span>
            )}
            {service.availableStandard && (
              <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">Standard</span>
            )}
            {service.availableVip && (
              <span className="text-sm font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">VIP Home</span>
            )}
          </div>

          {service.description && (
            <div className="mb-8">
              <h2 className="font-semibold text-gray-900 mb-2">About this service</h2>
              <p className="text-gray-700 leading-relaxed">{service.description}</p>
            </div>
          )}

          {service.specialists.length > 0 && (
            <div className="mb-8">
              <h2 className="font-semibold text-gray-900 mb-3">Available specialists</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {service.specialists.map(({ specialist }) => (
                  <button
                    key={specialist.id}
                    onClick={() => router.push(`/providers/${providerId}/specialists/${specialist.id}`)}
                    className="flex items-center gap-3 rounded-card border border-gray-100 p-4 text-left hover:border-bloom-200 hover:shadow-md transition-all"
                  >
                    <div className="h-11 w-11 flex-shrink-0 rounded-full bg-bloom-100 overflow-hidden flex items-center justify-center">
                      {specialist.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={specialist.photoUrl} alt={specialist.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-semibold text-bloom-600">{specialist.name[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{specialist.name}</p>
                      <p className="text-xs text-gray-600">{specialist.specialty}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => router.push(`/providers/${providerId}?service=${service.id}`)}
            className="w-full rounded-button bg-bloom-500 text-white font-semibold py-3.5 hover:bg-bloom-600 transition-colors"
          >
            Book This Service ✨
          </button>
        </div>
      </main>
    </>
  );
}
