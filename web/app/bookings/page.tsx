'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api, BookingListItem, BookingType } from '@/lib/api';
import { Navigation } from '@/components/ui/Navigation';
import { BookingStatusBadge, isUpcoming } from '@/components/ui/BookingStatusBadge';

type Filter = 'upcoming' | 'past';

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('upcoming');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/sign-in');
      return;
    }

    api.bookings
      .listMyBookings()
      .then(setBookings)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load your bookings'))
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = bookings.filter((b) => (filter === 'upcoming' ? isUpcoming(b.status) : !isUpcoming(b.status)));

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <h1 className="font-display text-2xl font-semibold text-gray-900">My Bookings</h1>

          <div className="mt-6 flex gap-2 border-b border-gray-100">
            {(['upcoming', 'past'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`border-b-2 px-1 pb-3 text-sm font-semibold capitalize transition-colors ${
                  filter === f ? 'border-bloom-500 text-bloom-600' : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {loading && <p className="text-gray-500">Loading your bookings…</p>}
            {error && (
              <div className="rounded-card border border-red-100 bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="rounded-card border-2 border-dashed border-gray-200 p-12 text-center">
                <svg className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0V11.25A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <p className="text-gray-600 font-medium">
                  {filter === 'upcoming' ? 'No upcoming bookings' : 'No past bookings yet'}
                </p>
                {filter === 'upcoming' && (
                  <button
                    onClick={() => router.push('/')}
                    className="mt-4 inline-flex items-center gap-2 rounded-button bg-bloom-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-bloom-600 transition-colors"
                  >
                    Browse salons
                  </button>
                )}
              </div>
            )}

            <div className="space-y-4">
              {filtered.map((booking) => (
                <button
                  key={booking.id}
                  onClick={() => router.push(`/bookings/${booking.id}`)}
                  className="w-full text-left rounded-card border border-gray-100 p-5 hover:border-bloom-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{booking.provider.businessName}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {booking.services.map((s) => s.service.name).join(', ')}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(booking.scheduledAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(booking.scheduledAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <BookingStatusBadge status={booking.status} />
                      <span className="text-sm font-semibold text-gray-900">
                        ETB {Number(booking.totalPrice).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {booking.bookingType === BookingType.VIP_HOME && (
                    <p className="mt-3 text-xs font-medium text-bloom-600"> VIP Home Service</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
