'use client';

import { api, Provider } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';

function SearchIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-4-4" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10.5L12 3l9 7.5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 9.5V21h13V9.5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 21v-6h6v6"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 3.5h3l1.5 4-2 1.5a15 15 0 006 6l1.5-2 4 1.5v3a2 2 0 01-2 2C10.5 19.5 4.5 13.5 4.5 5.5a2 2 0 012-2z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7l9 6 9-6"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
      />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12l4 4L19 7"
      />
    </svg>
  );
}

function VipIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l2.7 5.5 6.3.9-4.5 4.4 1.1 6.2L12 17l-5.6 3 1.1-6.2L3 9.4l6.3-.9L12 3z"
      />
    </svg>
  );
}

function formatDate(date: string | undefined) {
  if (!date) return '—';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getProviderImage(provider: Provider) {
  return provider.galleryImages?.[0]?.url || null;
}

function getProviderCategories(provider: Provider): string[] {
  const categoryValue = provider.category as
    | string
    | string[]
    | null
    | undefined;

  if (Array.isArray(categoryValue)) {
    return categoryValue
      .filter(
        (category): category is string =>
          typeof category === 'string' &&
          category.trim().length > 0,
      )
      .map((category) => category.trim());
  }

  if (typeof categoryValue === 'string') {
    const trimmed = categoryValue.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
}

function getCategory(provider: Provider) {
  const categories = getProviderCategories(provider);

  if (categories.length > 0) {
    return categories.join(', ');
  }

  return 'All';
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]?.charAt(0).toUpperCase() || 'P';
  }

  return (
    (parts[0]?.charAt(0) || '') +
    (parts[parts.length - 1]?.charAt(0) || '')
  ).toUpperCase();
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadProviders() {
    try {
      setLoading(true);
      setError('');

      const data = await api.admin.findAllProviders();

      setProviders(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load service providers.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProviders();
  }, []);

  const filteredProviders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return providers;
    }

    return providers.filter((provider) => {
      const businessName =
        provider.businessName?.toLowerCase() || '';

      const phone =
        provider.user?.phone?.toLowerCase() || '';

      const email =
        provider.user?.email?.toLowerCase() || '';

      const categories = getProviderCategories(provider)
        .join(' ')
        .toLowerCase();

      return (
        businessName.includes(query) ||
        phone.includes(query) ||
        email.includes(query) ||
        categories.includes(query)
      );
    });
  }, [providers, search]);

  async function toggleProvider(provider: Provider) {
    try {
      setUpdatingId(provider.id);
      setError('');

      if (provider.isEnabled) {
        await api.admin.disableProvider(provider.id);
      } else {
        await api.admin.enableProvider(provider.id);
      }

      setProviders((current) =>
        current.map((item) =>
          item.id === provider.id
            ? {
                ...item,
                isEnabled: !item.isEnabled,
              }
            : item,
        ),
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update provider status.',
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">
          Service Provider Information
        </h1>

        <p className="mt-1 text-gray-500">
          Manage salons and service providers registered on
          Bloom Booking.
        </p>
      </div>

      {/* Search */}
      <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-[0_6px_12px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xl">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search service provider by name, phone, email, or category..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-bloom-500 focus:bg-white focus:ring-2 focus:ring-bloom-100"
            />
          </div>

          <div className="rounded-xl bg-bloom-50 px-4 py-2 text-sm font-medium text-bloom-700">
            {filteredProviders.length}{' '}
            {filteredProviders.length === 1
              ? 'Provider'
              : 'Providers'}
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={loadProviders}
            className="shrink-0 rounded-xl bg-red-100 px-3 py-2 font-medium hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main provider table */}
      <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_6px_12px_rgba(0,0,0,0.08)]">
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="text-sm text-gray-500">
              Loading service providers...
            </div>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <HomeIcon />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No service providers found
            </h2>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              {search
                ? 'Try a different search term.'
                : 'There are currently no registered service providers.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1450px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Name
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Phone
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Email
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Category
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Description
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Address
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Image
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Verification
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      VIP Home
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Added Date
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProviders.map((provider) => {
                    const active = provider.isEnabled ?? true;

                    const verified =
                      provider.isVerified ?? false;

                    const vip =
                      provider.supportsVipHome ?? false;

                    const updating =
                      updatingId === provider.id;

                    const image =
                      getProviderImage(provider);

                    return (
                      <tr
                        key={provider.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70"
                      >
                        {/* Name */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-bloom-100 text-sm font-bold text-bloom-700">
                              {image ? (
                                <img
                                  src={image}
                                  alt={provider.businessName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                getInitials(
                                  provider.businessName,
                                )
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900">
                                {provider.businessName}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <PhoneIcon />

                            <span>
                              {provider.user?.phone || '—'}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-5">
                          <div className="flex max-w-[220px] items-center gap-2 text-sm text-gray-700">
                            <MailIcon />

                            <span className="truncate">
                              {provider.user?.email || '—'}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-5 text-sm capitalize text-gray-700">
                          {getCategory(provider)}
                        </td>

                        {/* Description */}
                        <td className="px-5 py-5">
                          <p className="max-w-[220px] text-sm text-gray-600">
                            {provider.about || '—'}
                          </p>
                        </td>

                        {/* Address */}
                        <td className="px-5 py-5">
                          <p className="max-w-[180px] text-sm text-gray-600">
                            {provider.address || '—'}
                          </p>
                        </td>

                        {/* Image */}
                        <td className="px-5 py-5">
                          {image ? (
                            <img
                              src={image}
                              alt={provider.businessName}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                              <HomeIcon />
                            </div>
                          )}
                        </td>

                        {/* Verification */}
                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                              verified
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {verified && <CheckIcon />}

                            {verified
                              ? 'Verified'
                              : 'Not Verified'}
                          </span>
                        </td>

                        {/* VIP */}
                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                              vip
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {vip && <VipIcon />}

                            {vip ? 'Supported' : 'No'}
                          </span>
                        </td>

                        {/* Added Date */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-600">
                            <CalendarIcon />

                            {formatDate(
                              provider.createdAt,
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {active
                              ? 'Enabled'
                              : 'Disabled'}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-5 text-right">
                          <button
                            type="button"
                            disabled={updating}
                            onClick={() =>
                              toggleProvider(provider)
                            }
                            className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              active
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {updating
                              ? 'Updating...'
                              : active
                                ? 'Disable'
                                : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-gray-100 lg:hidden">
              {filteredProviders.map((provider) => {
                const active = provider.isEnabled ?? true;

                const verified =
                  provider.isVerified ?? false;

                const vip =
                  provider.supportsVipHome ?? false;

                const updating =
                  updatingId === provider.id;

                const image =
                  getProviderImage(provider);

                return (
                  <div
                    key={provider.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-bloom-100 text-sm font-bold text-bloom-700">
                          {image ? (
                            <img
                              src={image}
                              alt={provider.businessName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getInitials(
                              provider.businessName,
                            )
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">
                            {provider.businessName}
                          </p>

                          <p className="truncate text-xs text-gray-500">
                            {getCategory(provider)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {active
                          ? 'Enabled'
                          : 'Disabled'}
                      </span>
                    </div>

                    <div className="mt-5 space-y-3 text-sm text-gray-600">
                      <div className="flex items-center gap-3">
                        <PhoneIcon />

                        <span>
                          {provider.user?.phone ||
                            'No phone'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <MailIcon />

                        <span className="truncate">
                          {provider.user?.email ||
                            'No email'}
                        </span>
                      </div>

                      <div>
                        <span className="font-medium text-gray-800">
                          Address:
                        </span>{' '}
                        {provider.address || '—'}
                      </div>

                      <div>
                        <span className="font-medium text-gray-800">
                          Description:
                        </span>{' '}
                        {provider.about || '—'}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            verified
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {verified
                            ? 'Verified'
                            : 'Not Verified'}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            vip
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {vip
                            ? 'VIP Home Supported'
                            : 'VIP Home Not Supported'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <CalendarIcon />

                        <span>
                          Added{' '}
                          {formatDate(
                            provider.createdAt,
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={updating}
                      onClick={() =>
                        toggleProvider(provider)
                      }
                      className={`mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        active
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {updating
                        ? 'Updating...'
                        : active
                          ? 'Disable Service Provider'
                          : 'Enable Service Provider'}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}