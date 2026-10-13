'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, SpecialistDetail, Provider } from '@/lib/api';
import { Navigation } from '@/components/ui/Navigation';

export default function SpecialistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;
  const specialistId = params.specialistId as string;

  const [specialist, setSpecialist] = useState<SpecialistDetail | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.specialists.getOne(specialistId), api.providers.getOne(providerId)])
      .then(([specialistData, providerData]) => {
        setSpecialist(specialistData);
        setProvider(providerData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load this specialist'))
      .finally(() => setLoading(false));
  }, [specialistId, providerId]);

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

  if (error || !specialist || !provider) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-white px-6 py-8">
          <div className="mx-auto max-w-2xl rounded-card border border-red-100 bg-red-50 p-6">
            <p className="text-red-700 font-medium">{error || 'Specialist not found'}</p>
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

          <div className="flex items-center gap-5 mb-6">
            <div className="h-24 w-24 flex-shrink-0 rounded-card bg-gradient-to-br from-bloom-100 to-bloom-50 border border-bloom-200 overflow-hidden flex items-center justify-center">
              {specialist.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={specialist.photoUrl} alt={specialist.name} className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-3xl font-bold text-bloom-600">{specialist.name[0]}</span>
              )}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">{specialist.name}</h1>
              <p className="text-bloom-600 font-medium mt-0.5">{specialist.specialty}</p>
              {specialist.supportsVipHome && (
                <p className="text-sm font-medium text-gray-600 mt-1">🚗 Offers VIP Home Service</p>
              )}
            </div>
          </div>

          {specialist.bio && (
            <div className="mb-8">
              <h2 className="font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-gray-700 leading-relaxed">{specialist.bio}</p>
            </div>
          )}

          {specialist.services.length > 0 && (
            <div className="mb-8">
              <h2 className="font-semibold text-gray-900 mb-3">Services offered</h2>
              <div className="space-y-3">
                {specialist.services.map(({ service }) => (
                  <button
                    key={service.id}
                    onClick={() => router.push(`/providers/${providerId}/services/${service.id}`)}
                    className="w-full flex items-center justify-between gap-4 rounded-card border border-gray-100 p-4 text-left hover:border-bloom-200 hover:shadow-md transition-all"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{service.name}</p>
                      <p className="text-xs text-gray-600 mt-0.5">⏱️ {service.durationMin} min</p>
                    </div>
                    <p className="font-semibold text-bloom-600 whitespace-nowrap">
                      ETB {Number(service.price).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => router.push(`/providers/${providerId}?specialist=${specialist.id}`)}
            className="w-full rounded-button bg-bloom-500 text-white font-semibold py-3.5 hover:bg-bloom-600 transition-colors"
          >
            Book with {specialist.name.split(' ')[0]} ✨
          </button>
        </div>
      </main>
    </>
  );
}
