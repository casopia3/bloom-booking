'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, Specialist } from '@/lib/api';

type SpecialistRow = Specialist & {
  user?: {
    id?: string;
    phone?: string | null;
    email?: string | null;
    isActive?: boolean;
  } | null;
  provider?: {
    businessName?: string | null;
  } | null;
  createdAt?: string;
};

function SearchIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" />
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
      strokeWidth="2"
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0 1 22 16.9Z" />
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
      strokeWidth="2"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
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
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
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
      strokeWidth="2.5"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function formatDate(date?: string) {
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

function getInitials(name?: string) {
  if (!name) return 'S';

  const parts = name.trim().split(/\s+/);

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function getProviderName(specialist: Specialist) {
  return specialist.provider?.businessName || 'Independent';
}

export default function SpecialistsPage() {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadSpecialists() {
    try {
      setLoading(true);
      setError('');

      const data = await api.admin.findAllSpecialists();

      setSpecialists(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load specialists.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSpecialists();
  }, []);

  const filteredSpecialists = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return specialists;
    }

    return specialists.filter((specialist) => {
      const name = specialist.name?.toLowerCase() || '';
      const phone = specialist.user?.phone?.toLowerCase() || '';
      const email = specialist.user?.email?.toLowerCase() || '';
      const provider = getProviderName(specialist).toLowerCase();

      return (
        name.includes(query) ||
        phone.includes(query) ||
        email.includes(query) ||
        provider.includes(query)
      );
    });
  }, [specialists, search]);

  async function toggleSpecialist(specialist: Specialist) {
    const userId = specialist.user?.id;

    if (!userId) {
      setError('This specialist does not have a linked user account.');
      return;
    }

    try {
      setUpdatingId(specialist.id);
      setError('');

      const active = specialist.user.isActive;

      if (active) {
        await api.admin.disableUser(userId);
      } else {
        await api.admin.enableUser(userId);
      }

      setSpecialists((current) =>
        current.map((item) =>
          item.id === specialist.id
            ? {
                ...item,
                user: {
                  ...item.user,
                  isActive: !active,
                },
              }
            : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update specialist status.',
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Specialists
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage Bloom specialists and their account access.
        </p>
      </div>

      {/* Search + count */}
      <section className="rounded-[28px] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <SearchIcon />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, phone, email or salon..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-bloom-400 focus:bg-white focus:ring-2 focus:ring-bloom-100"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <UserIcon />

            <span>
              {filteredSpecialists.length}{' '}
              {filteredSpecialists.length === 1
                ? 'Specialist'
                : 'Specialists'}
            </span>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Content */}
      <section className="overflow-hidden rounded-[28px] bg-white shadow-sm">
        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-bloom-500" />
              Loading specialists...
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredSpecialists.length === 0 && (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bloom-50 text-bloom-600">
              <UserIcon />
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              No specialists found
            </h2>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              {search
                ? 'Try changing your search terms.'
                : 'There are no specialists registered yet.'}
            </p>
          </div>
        )}

        {/* Desktop table */}
        {!loading && filteredSpecialists.length > 0 && (
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Specialist
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Service Provider
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Registered
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredSpecialists.map((specialist) => {
                  const active = specialist.user?.isActive ?? true;
                  const updating = updatingId === specialist.id;

                  return (
                    <tr
                      key={specialist.id}
                      className="transition hover:bg-gray-50/70"
                    >
                      {/* Specialist */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bloom-100 text-sm font-bold text-bloom-700">
                            {getInitials(specialist.name)}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {specialist.name || 'Unnamed Specialist'}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-400">
                              Specialist
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-5">
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <PhoneIcon />
                            <span>
                              {specialist.user?.phone || '—'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-500">
                            <MailIcon />
                            <span>
                              {specialist.user?.email || '—'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Provider */}
                      <td className="px-6 py-5">
                        <p className="max-w-[190px] truncate text-sm font-medium text-gray-800">
                          {getProviderName(specialist)}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarIcon />
                          {formatDate(specialist.createdAt)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            active
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {active && <CheckIcon />}
                          {active ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          disabled={updating}
                          onClick={() => toggleSpecialist(specialist)}
                          className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            active
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-bloom-50 text-bloom-700 hover:bg-bloom-100'
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
        )}

        {/* Mobile cards */}
        {!loading && filteredSpecialists.length > 0 && (
          <div className="space-y-4 p-4 lg:hidden">
            {filteredSpecialists.map((specialist) => {
              const active = specialist.user?.isActive ?? true;
              const updating = updatingId === specialist.id;

              return (
                <div
                  key={specialist.id}
                  className="rounded-2xl border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bloom-100 text-sm font-bold text-bloom-700">
                        {getInitials(specialist.name)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">
                          {specialist.name || 'Unnamed Specialist'}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-gray-400">
                          {getProviderName(specialist)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {active ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <PhoneIcon />
                      <span>{specialist.user?.phone || '—'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500">
                      <MailIcon />
                      <span className="break-all">
                        {specialist.user?.email || '—'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500">
                      <CalendarIcon />
                      <span>
                        Registered {formatDate(specialist.createdAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => toggleSpecialist(specialist)}
                    className={`mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      active
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-bloom-50 text-bloom-700 hover:bg-bloom-100'
                    }`}
                  >
                    {updating
                      ? 'Updating...'
                      : active
                        ? 'Disable Specialist'
                        : 'Enable Specialist'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}