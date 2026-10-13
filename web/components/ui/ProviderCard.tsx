import Link from 'next/link';
import { Provider } from '@/lib/api';

export function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <Link
      href={`/providers/${provider.id}`}
      className="group block overflow-hidden rounded-card border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex h-40 items-center justify-center overflow-hidden bg-bloom-100">
        {provider.galleryImages[0] ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                provider.galleryImages[0].url.startsWith('http')
                  ? provider.galleryImages[0].url
                  : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${provider.galleryImages[0].url}`
              }
              alt={provider.businessName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </>
        ) : (
          <span className="font-display text-lg text-bloom-400">{provider.businessName}</span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-gray-900">
  {provider.businessName}
</h3>
          {provider.distanceKm != null && (
            <span className="whitespace-nowrap rounded-full bg-bloom-50 px-2.5 py-1 text-xs font-semibold text-bloom-600">{provider.distanceKm} km</span>
          )}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
              clipRule="evenodd"
            />
          </svg>
          {provider.address}
        </p>
        {provider.supportsVipHome && (
          <span className="mt-3 inline-block rounded-full bg-bloom-100 px-3 py-1 text-xs font-semibold text-bloom-600">
            VIP Home Service available
          </span>
        )}
      </div>
    </Link>
  );
}
