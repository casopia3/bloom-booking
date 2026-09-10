import Link from 'next/link';
import { Provider } from '@/lib/api';

export function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <Link
      href={`/providers/${provider.id}`}
      className="block overflow-hidden rounded-card border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex h-36 items-center justify-center bg-bloom-100">
        {provider.galleryImages[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={provider.galleryImages[0].url} alt={provider.businessName} className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-lg text-bloom-400">{provider.businessName}</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900">{provider.businessName}</h3>
          {provider.distanceKm != null && (
            <span className="whitespace-nowrap text-sm font-medium text-bloom-500">{provider.distanceKm} km</span>
          )}
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
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
          <span className="mt-2 inline-block rounded-full bg-bloom-100 px-2.5 py-0.5 text-xs font-medium text-bloom-600">
            VIP Home Service available
          </span>
        )}
      </div>
    </Link>
  );
}
