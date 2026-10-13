'use client';

import { api, Customer } from '@/lib/api';
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
      <path
        strokeLinecap="round"
        d="M20 20l-4-4"
      />
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
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path
        strokeLinecap="round"
        d="M5 20a7 7 0 0114 0"
      />
    </svg>
  );
}

function PhoneIcon() {
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
        d="M6.5 3.5h3l1.5 4-2 1.5a15 15 0 006 6l1.5-2 4 1.5v3a2 2 0 01-2 2C10.5 19.5 4.5 13.5 4.5 5.5a2 2 0 012-2z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      className="h-5 w-5"
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
      className="h-5 w-5"
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

function MoreIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
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

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]?.charAt(0).toUpperCase() || 'C';
  }

  return (
    (parts[0]?.charAt(0) || '') +
    (parts[parts.length - 1]?.charAt(0) || '')
  ).toUpperCase();
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(
    null,
  );

  async function loadCustomers() {
    try {
      setLoading(true);
      setError('');

      const data = await api.admin.findAllCustomers();

      setCustomers(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load customers.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      const name = customer.name.toLowerCase();

      const phone =
        customer.user?.phone?.toLowerCase() || '';

      const email =
        customer.user?.email?.toLowerCase() || '';

      const gender =
        customer.gender?.toLowerCase() || '';

      const occupation =
        customer.occupation?.toLowerCase() || '';

      return (
        name.includes(query) ||
        phone.includes(query) ||
        email.includes(query) ||
        gender.includes(query) ||
        occupation.includes(query)
      );
    });
  }, [customers, search]);

  async function toggleUser(
    customer: Customer,
  ) {
    const userId = customer.user?.id;

    if (!userId) {
      setError(
        'This customer does not have a valid user ID.',
      );
      return;
    }

    try {
      setUpdatingId(customer.id);
      setError('');

      if (customer.user.isActive) {
        await api.admin.disableUser(userId);
      } else {
        await api.admin.enableUser(userId);
      }

      setCustomers((current) =>
        current.map((item) => {
          if (item.id !== customer.id) {
            return item;
          }

          return {
            ...item,
            user: {
              ...item.user,
              isActive: !item.user.isActive,
            },
          };
        }),
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update customer status.',
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">
          Customer
        </h1>

        <p className="mt-1 text-gray-500">
          Manage customers registered on Bloom Booking.
        </p>
      </div>

      {/* Search + count */}
      <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-[0_6px_12px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <SearchIcon />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search customers..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-bloom-500 focus:bg-white focus:ring-2 focus:ring-bloom-100"
            />

            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>

          <div className="rounded-xl bg-bloom-50 px-4 py-2 text-sm font-medium text-bloom-700">
            {filteredCustomers.length}{' '}
            {filteredCustomers.length === 1
              ? 'Customer'
              : 'Customers'}
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={loadCustomers}
            className="shrink-0 rounded-xl bg-red-100 px-3 py-2 font-medium hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Customer table */}
      <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_6px_12px_rgba(0,0,0,0.08)]">
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="text-sm text-gray-500">
              Loading customers...
            </div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <UserIcon />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No customers found
            </h2>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              {search
                ? 'Try a different search term.'
                : 'There are currently no registered customers.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Gender
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Joined
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => {
                    const active =
                      customer.user?.isActive ?? true;

                    const updating =
                      updatingId === customer.id;

                    return (
                      <tr
                        key={customer.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bloom-100 text-sm font-bold text-bloom-700">
                              {getInitials(
                                customer.name,
                              )}
                            </div>

                            <div>
                              <p className="font-semibold text-gray-900">
                                {customer.name}
                              </p>

                              <p className="text-xs text-gray-500">
                                {customer.occupation ||
                                  'Customer'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-700">
                          {customer.user?.phone || '—'}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-700">
                          {customer.user?.email || '—'}
                        </td>

                        <td className="px-6 py-5 text-sm capitalize text-gray-700">
                          {customer.gender?.toLowerCase() ||
                            '—'}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-700">
                          {formatDate(
                            customer.user?.createdAt ||
                              customer.createdAt,
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {active
                              ? 'Active'
                              : 'Inactive'}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            disabled={updating}
                            onClick={() =>
                              toggleUser(customer)
                            }
                            className={`rounded-xl px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
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

            {/* Mobile cards */}
            <div className="divide-y divide-gray-100 lg:hidden">
              {filteredCustomers.map((customer) => {
                const active =
                  customer.user?.isActive ?? true;

                const updating =
                  updatingId === customer.id;

                return (
                  <div
                    key={customer.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bloom-100 text-sm font-bold text-bloom-700">
                          {getInitials(
                            customer.name,
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">
                            {customer.name}
                          </p>

                          <p className="truncate text-xs text-gray-500">
                            {customer.occupation ||
                              'Customer'}
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
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-3">
                        <PhoneIcon />
                        <span>
                          {customer.user?.phone ||
                            'No phone'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <MailIcon />
                        <span className="truncate">
                          {customer.user?.email ||
                            'No email'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <CalendarIcon />
                        <span>
                          Joined{' '}
                          {formatDate(
                            customer.user?.createdAt ||
                              customer.createdAt,
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={updating}
                      onClick={() =>
                        toggleUser(customer)
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
                          ? 'Disable Customer'
                          : 'Enable Customer'}
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