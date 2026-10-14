'use client';

import { useEffect, useMemo, useState } from 'react';

import { api, ApiError, Service } from '@/lib/api';

type AdminService = Service & {
  createdAt: string;
  provider: {
    id: string;
    businessName: string;
    isEnabled: boolean;
  } | null;
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      setLoading(true);
      setError('');

      const data = await api.admin.findAllServices();

      setServices(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load services.');
      }
    } finally {
      setLoading(false);
    }
  }

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return services;
    }

    return services.filter((service) => {
      return (
        service.name.toLowerCase().includes(query) ||
        (service.category ?? '').toLowerCase().includes(query) ||
        (service.provider?.businessName ?? '').toLowerCase().includes(query)
      );
    });
  }, [services, search]);

  function formatPrice(price: number | string) {
    const value = Number(price);

    if (Number.isNaN(value)) {
      return String(price);
    }

    return `${value.toLocaleString()} ETB`;
  }

  function formatDuration(minutes: number) {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    if (remaining === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${remaining} min`;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Services
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor services offered on Bloom Booking.
          </p>
        </div>

        <div className="rounded-2xl bg-bloom-50 px-4 py-3">
          <p className="text-xs font-medium text-bloom-600">
            Total Services
          </p>

          <p className="text-xl font-bold text-bloom-700">
            {services.length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by service, category, or provider..."
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-bloom-400 focus:bg-white focus:ring-2 focus:ring-bloom-100"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={loadServices}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="rounded-[28px] bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-bloom-500" />

          <p className="mt-4 text-sm text-gray-500">
            Loading services...
          </p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-[28px] bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-bloom-50">
            <svg
              className="h-7 w-7 text-bloom-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 5h16v14H4z" />
              <path d="M8 9h8M8 13h5" />
            </svg>
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            No services found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {search
              ? 'Try changing your search.'
              : 'There are no services available yet.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-gray-100 lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Service
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Provider
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Category
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Price
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Duration
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Standard
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      VIP Home
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredServices.map((service) => (
                    <tr
                      key={service.id}
                      className="transition hover:bg-gray-50/60"
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {service.name}
                          </p>

                          {service.description && (
                            <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                              {service.description}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-gray-400">
                            Added {formatDate(service.createdAt)}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div>
                          <p className="font-medium text-gray-800">
                            {service.provider?.businessName ?? 'Unknown provider'}
                          </p>

                          <span
                            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              service.provider?.isEnabled
                                ? 'bg-green-50 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {service.provider?.isEnabled
                              ? 'Provider active'
                              : 'Provider disabled'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-bloom-50 px-3 py-1.5 text-xs font-medium text-bloom-700">
                          {service.category || 'Uncategorized'}
                        </span>
                      </td>

                      <td className="px-6 py-5 font-semibold text-gray-900">
                        {formatPrice(service.price)}
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-600">
                        {formatDuration(service.durationMin)}
                      </td>

                      <td className="px-6 py-5">
                        <AvailabilityBadge
                          available={service.availableStandard}
                        />
                      </td>

                      <td className="px-6 py-5">
                        <AvailabilityBadge
                          available={service.availableVip}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-4 lg:hidden">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-gray-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-gray-900">
                      {service.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {service.provider?.businessName ?? 'Unknown provider'}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-bloom-50 px-3 py-1.5 text-xs font-medium text-bloom-700">
                    {service.category || 'Uncategorized'}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <InfoItem
                    label="Price"
                    value={formatPrice(service.price)}
                  />

                  <InfoItem
                    label="Duration"
                    value={formatDuration(service.durationMin)}
                  />

                  <InfoItem
                    label="Standard"
                    value={
                      service.availableStandard
                        ? 'Available'
                        : 'Unavailable'
                    }
                  />

                  <InfoItem
                    label="VIP Home"
                    value={
                      service.availableVip
                        ? 'Available'
                        : 'Unavailable'
                    }
                  />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-xs text-gray-400">
                    Added {formatDate(service.createdAt)}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      service.provider?.isEnabled
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {service.provider?.isEnabled
                      ? 'Provider active'
                      : 'Provider disabled'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Result count */}
          <p className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-semibold text-gray-700">
              {filteredServices.length}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-gray-700">
              {services.length}
            </span>{' '}
            services
          </p>
        </>
      )}
    </div>
  );
}

function AvailabilityBadge({
  available,
}: {
  available: boolean;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
        available
          ? 'bg-green-50 text-green-700'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      {available ? 'Available' : 'Unavailable'}
    </span>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-3">
      <p className="text-xs text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}
