'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api, Provider, Service, Specialist, Review } from '@/lib/api';
import { BookingModal } from '@/components/booking/BookingModal';

type Tab = 'info' | 'services' | 'specialists' | 'reviews';

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerId = params.id as string;
  const preselectedServiceId = searchParams.get('service');
  const preselectedSpecialistId = searchParams.get('specialist');

  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const handleShare = useCallback(async () => {
  const shareUrl = window.location.href;
  const shareData = {
    title: provider?.businessName || 'Bloom Booking',
    text: `Check out ${provider?.businessName || 'this salon'} on Bloom Booking!`,
    url: shareUrl,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      window.alert('Salon link copied! You can now share it.');
    } else {
      window.prompt('Copy this salon link to share:', shareUrl);
    }
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      window.prompt('Copy this salon link to share:', shareUrl);
    }
  }
}, [provider?.businessName]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const providerData = await api.providers.getOne(providerId);
        setProvider(providerData);

        const servicesData = await api.providers.getServices(providerId).catch(() => []);
        const specialistsData = await api.providers.getSpecialists(providerId).catch(() => []);
        const reviewsData = await api.providers.getReviews(providerId).catch(() => []);

        setServices(servicesData || []);
        setSpecialists(specialistsData || []);
        setReviews(reviewsData || []);

        if (preselectedServiceId || preselectedSpecialistId) {
          setShowBookingModal(true);
        }
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
      <main className="min-h-screen bg-white">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-bloom-200 border-t-bloom-500 mx-auto"></div>
            <p className="text-gray-600">Loading salon details…</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !provider) {
    return (
      <main className="min-h-screen bg-white px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <button
           onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-bloom-600 hover:text-bloom-700 font-medium transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="rounded-card border border-red-100 bg-red-50 p-6">
            <p className="text-red-700 font-medium">{error || 'Salon not found'}</p>
          </div>
        </div>
      </main>
    );
  }

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-80 bg-gradient-to-b from-bloom-100 to-bloom-50 overflow-hidden">
        {provider.galleryImages[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
           src={
  provider.galleryImages[0].url.startsWith('http')
    ? provider.galleryImages[0].url
    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${provider.galleryImages[0].url}`
}
            alt={provider.businessName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-b from-bloom-100 to-bloom-50">
            <div className="text-center">
              <div className="text-5xl mb-3">✨</div>
              <span className="font-display text-3xl font-semibold text-bloom-600">{provider.businessName}</span>
            </div>
          </div>
        )}

       
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.push('/')}
          aria-label="Back to home"
          className="absolute left-4 top-4 z-20 rounded-full bg-white/90 backdrop-blur-sm p-2.5 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200"
        >
          <svg className="h-6 w-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Gradient overlay for text readability */}
       <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Provider Header Card */}
      <div className="relative z-10 px-6 pb-8">
        <div className="mx-auto max-w-3xl">
          <div className="relative -mt-16 rounded-card bg-white p-6 shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-3xl font-bold text-gray-900">{provider.businessName}</h1>
                  {provider.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="h-5 w-5 flex-shrink-0 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L9.9 13.95a.75.75 0 01-1.06-1.06l4.05-4.05a7 7 0 00-9.9-9.9zM9.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{provider.address}</span>
                  </div>
                </div>
              </div>

              {/* Rating Section */}
              {avgRating && (
                <div className="flex flex-col items-end gap-1 rounded-card bg-bloom-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-2xl font-bold text-bloom-600">{avgRating}</span>
                    <svg className="h-6 w-6 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</p>
                </div>
              )}
            </div>

            {/* About & VIP Section */}
            {provider.about && (
              <p className="mt-4 text-gray-700 leading-relaxed">{provider.about}</p>
            )}

            {provider.supportsVipHome && (
              <div className="mt-4 rounded-card border border-purple-200 bg-gradient-to-r from-purple-50 to-bloom-50 p-4">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 mt-0.5 text-bloom-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0015.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                  <div>
                    <p className="font-medium text-bloom-900">VIP Home Service Available</p>
                    <p className="text-sm text-bloom-700 mt-0.5">
                      We come to your home within <strong>{provider.vipServiceRadiusKm} km</strong>
                      {provider.vipTravelFee && ` • Travel fee: ETB ${provider.vipTravelFee}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Book Now Button */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowBookingModal(true)}
                className="flex-1 px-6 py-3 rounded-button bg-bloom-500 text-white font-semibold hover:bg-bloom-600 transition-colors shadow-sm hover:shadow-md"
              >
                Book Now ✨
              </button>
            <button
  type="button"
  onClick={handleShare}
  className="px-6 py-3 rounded-button border border-gray-300 text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
>
  Share
</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="border-t border-gray-100">
        <div className="mx-auto max-w-3xl px-6">
          <div className="flex gap-8 overflow-x-auto">
            {(['info', 'services', 'specialists', 'reviews'] as Tab[]).map((tab) => {
              const counts = {
                info: 0,
                services: services.length,
                specialists: specialists.length,
                reviews: reviews.length,
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-3 px-1 py-4 font-semibold whitespace-nowrap text-sm transition-all duration-200 ${
                    activeTab === tab
                      ? 'border-bloom-500 text-bloom-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'info' && 'Information'}
                  {tab === 'services' && `Services (${counts.services})`}
                  {tab === 'specialists' && `Specalist (${counts.specialists})`}
                  {tab === 'reviews' && `Reviews (${counts.reviews})`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-8 border-t border-gray-100">
        <div className="mx-auto max-w-3xl">
          {activeTab === 'info' && <InfoTab provider={provider} />}
          {activeTab === 'services' && <ServicesTab services={services} providerId={providerId} />}
          {activeTab === 'specialists' && <SpecialistsTab specialists={specialists} providerId={providerId} />}
          {activeTab === 'reviews' && <ReviewsTab reviews={reviews} />}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          provider={provider}
          services={services}
          specialists={specialists}
          initialServiceId={preselectedServiceId}
          initialSpecialistId={preselectedSpecialistId}
          onClose={() => setShowBookingModal(false)}
          onSuccess={(bookingId) => {
            setShowBookingModal(false);
            router.push(`/bookings/${bookingId}?confirmed=1`);
          }}
        />
      )}
    </main>
  );
}

function InfoTab({ provider }: { provider: Provider }) {
  return (
    <div className="space-y-8">
      {provider.galleryImages.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">Photo Gallery</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {provider.galleryImages.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <div key={img.id} className="aspect-square overflow-hidden rounded-card bg-gray-100 shadow-sm hover:shadow-md transition-shadow">
               <img
  src={
    img.url.startsWith('http')
      ? img.url
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${img.url}`
  }
  alt="Gallery"
  className="h-full w-full object-cover"
/>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-card border border-gray-100 bg-gray-50 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">📍 Location</h3>
          <p className="text-gray-700">{provider.address}</p>
        </div>

        {provider.supportsVipHome && (
          <div className="rounded-card border border-bloom-200 bg-bloom-50 p-6">
            <h3 className="font-semibold text-bloom-900 mb-2">🚗 Service Coverage</h3>
            <p className="text-bloom-800">{provider.vipServiceRadiusKm} km radius</p>
          </div>
        )}
      </div>

      {provider.about && (
        <div>
          <h3 className="font-display text-lg font-semibold text-gray-900 mb-3">About</h3>
          <p className="text-gray-700 leading-relaxed">{provider.about}</p>
        </div>
      )}
    </div>
  );
}

function ServicesTab({ services, providerId }: { services: Service[]; providerId: string }) {
  const router = useRouter();

  if (services.length === 0) {
    return (
      <div className="rounded-card border-2 border-dashed border-gray-200 p-12 text-center">
        <svg className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <p className="text-gray-600 font-medium">Services coming soon</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <button
          key={service.id}
          onClick={() => router.push(`/providers/${providerId}/services/${service.id}`)}
          className="w-full text-left rounded-card border border-gray-100 hover:border-bloom-200 hover:shadow-md transition-all p-5 cursor-pointer group"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 group-hover:text-bloom-600 transition-colors">{service.name}</h4>
              {service.description && (
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{service.description}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                  ⏱️ {service.durationMin} min
                </span>
                {service.category && (
                  <span className="inline-flex items-center text-xs font-medium text-bloom-700 bg-bloom-50 px-2 py-1 rounded-full">
                    {service.category}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-xl font-bold text-bloom-600">ETB {Number(service.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              <div className="mt-2 flex gap-1">
                {service.availableStandard && (
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">Standard</span>
                )}
                {service.availableVip && (
                  <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-full">VIP</span>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function SpecialistsTab({ specialists, providerId }: { specialists: Specialist[]; providerId: string }) {
  const router = useRouter();

  if (specialists.length === 0) {
    return (
      <div className="rounded-card border-2 border-dashed border-gray-200 p-12 text-center">
        <svg className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20H1v-2a3 3 0 015.856-1.487" />
        </svg>
        <p className="text-gray-600 font-medium">Team coming soon</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {specialists.map((specialist) => (
        <button
          key={specialist.id}
          onClick={() => router.push(`/providers/${providerId}/specialists/${specialist.id}`)}
          className="text-left rounded-card border border-gray-100 hover:border-bloom-200 hover:shadow-md transition-all overflow-hidden hover:scale-105 duration-200 cursor-pointer"
        >
          <div className="p-5">
            <div className="flex gap-4">
              <div className="h-20 w-20 flex-shrink-0 rounded-card bg-gradient-to-br from-bloom-100 to-bloom-50 overflow-hidden border border-bloom-200">
                {specialist.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={specialist.photoUrl}
                    alt={specialist.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-2xl font-bold text-bloom-600">
                    {specialist.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{specialist.name}</h4>
                <p className="text-sm text-bloom-600 font-medium mt-0.5">{specialist.specialty}</p>
                {specialist.bio && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{specialist.bio}</p>
                )}
                {specialist.supportsVipHome && (
                  <p className="text-xs font-semibold text-bloom-600 mt-2">🚗 VIP Home Service</p>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function ReviewsTab({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-card border-2 border-dashed border-gray-200 p-12 text-center">
        <svg className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-600 font-medium">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-card border border-gray-100 hover:shadow-md transition-shadow p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="font-semibold text-gray-900">{review.customer.name}</p>
              <div className="mt-1.5 flex gap-1">
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
            <p className="text-xs text-gray-500 flex-shrink-0">
              {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          {review.comment && (
            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}
