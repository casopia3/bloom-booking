'use client';
import BloomMap from '@/components/maps/BloomMap';
import { useEffect, useState, useCallback } from 'react';
import { api, ApiError, Provider, BookingListItem, BookingStatus, BookingType } from '@/lib/api';
function isToday(isoDate: string) {
  const d = new Date(isoDate);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

const NON_TERMINAL_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.SPECIALIST_ASSIGNED,
  BookingStatus.ON_THE_WAY,
  BookingStatus.IN_PROGRESS,
];

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-1 flex-col items-center rounded-card bg-bloom-50 px-4 py-5 text-center">
      <span className="font-display text-3xl font-bold text-bloom-700">{value}</span>
      <span className="mt-1 text-sm text-gray-500">{label}</span>
    </div>
  );
}

function serviceNames(booking: BookingListItem) {
  return booking.services.map((s) => s.service.name).join(', ');
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function PendingRequestCard({ booking, onDecision }: { booking: BookingListItem; onDecision: () => void }) {
  const [actioning, setActioning] = useState<'accept' | 'decline' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function respond(next: BookingStatus, kind: 'accept' | 'decline') {
    setActioning(kind);
    setError(null);
    try {
      await api.bookings.updateStatus(booking.id, next);
      onDecision();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update this booking.');
      setActioning(null);
    }
  }

  return (
    <div className="rounded-card bg-bloom-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display font-semibold text-bloom-700">{booking.customer.name}</p>
          <p className="mt-0.5 truncate text-sm text-gray-600">{serviceNames(booking)}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {new Date(booking.scheduledAt).toLocaleDateString()} · {formatTime(booking.scheduledAt)}
            {booking.bookingType === BookingType.VIP_HOME ? ' · VIP' : ''}
          </p>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => respond(BookingStatus.CONFIRMED, 'accept')}
          disabled={actioning !== null}
          className="flex-1 rounded-button bg-bloom-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-bloom-600 disabled:opacity-50"
        >
          {actioning === 'accept' ? 'Please wait…' : 'Accept'}
        </button>
        <button
          onClick={() => respond(BookingStatus.DECLINED, 'decline')}
          disabled={actioning !== null}
          className="flex-1 rounded-button bg-white py-2 text-sm font-semibold text-bloom-600 transition-colors hover:bg-bloom-100 disabled:opacity-50"
        >
          {actioning === 'decline' ? 'Please wait…' : 'Decline'}
        </button>
      </div>
    </div>
  );
}

function AppointmentCard({ booking }: { booking: BookingListItem }) {
  return (
    <div className="rounded-card bg-bloom-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display font-semibold text-bloom-700">{booking.customer.name}</p>
          <p className="mt-0.5 truncate text-sm text-gray-600">{serviceNames(booking)}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {formatTime(booking.scheduledAt)}
            {booking.specialist ? ` · ${booking.specialist.name}` : ''}
          </p>
        </div>
        <span className="flex-shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-bloom-600">
          {booking.status.replace(/_/g, ' ')}
        </span>
      </div>
    </div>
  );
}

export default function ProviderHomePage() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [rating, setRating] = useState<{ average: number | null; count: number } | null>(null);
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const providerData = await api.providers.getMine();
      setProvider(providerData);
      const [ratingData, bookingsData] = await Promise.all([
        api.providers.getReviewSummary(providerData.id),
        api.bookings.listMyBookings(),
      ]);
      setRating(ratingData);
      setBookings(bookingsData);
    } catch {
      setError('Could not load your dashboard right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return <p className="text-gray-500">Loading your dashboard…</p>;
  }

  if (error || !provider) {
    return <p className="text-red-500">{error ?? 'Something went wrong.'}</p>;
  }

  const todaysAppointments = bookings.filter(
    (b) => isToday(b.scheduledAt) && NON_TERMINAL_STATUSES.includes(b.status) && b.status !== BookingStatus.PENDING,
  );
  const pendingRequests = bookings.filter((b) => b.status === BookingStatus.PENDING);
  const vipCount = bookings.filter(
    (b) => b.bookingType === BookingType.VIP_HOME && NON_TERMINAL_STATUSES.includes(b.status),
  ).length;

  const photoUrl = provider.galleryImages[0]?.url;

  return (
    <div className="space-y-8">
      {/* Business Profile Header */}
      <div className="flex items-center gap-4 rounded-card bg-bloom-100 p-5">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-bloom-500 shadow-sm">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={provider.businessName} className="h-full w-full object-cover" />
          ) : (
            <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-bold text-bloom-700">{provider.businessName}</h1>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-600">
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
            </svg>
            {provider.address}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-bloom-600">
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.287 3.958c.3.922-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.175 0l-3.367 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.958a1 1 0 00-.363-1.118L2.075 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.951-.69l1.286-3.958z" />
            </svg>
            {rating && rating.count > 0 ? `${rating.average} (${rating.count} reviews)` : 'No reviews yet'}
          </p>
        </div>
      </div>

      {/* Today's Overview */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-gray-900">Today&apos;s Overview</h2>
        <div className="flex gap-3">
          <StatCard label="Today's Appointments" value={todaysAppointments.length} />
          <StatCard label="Pending Requests" value={pendingRequests.length} />
          <StatCard label="VIP Bookings" value={vipCount} />
        </div>
      </div>

      {/* Pending Requests */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-gray-900">Pending Requests</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-sm text-gray-500">No pending requests right now.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {pendingRequests.map((b) => (
              <PendingRequestCard key={b.id} booking={b} onDecision={load} />
            ))}
          </div>
        )}
      </div>

      {/* Today's Appointments */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-gray-900">Today&apos;s Appointments</h2>
        {todaysAppointments.length === 0 ? (
          <p className="text-sm text-gray-500">No appointments scheduled for today.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {todaysAppointments.map((b) => (
              <AppointmentCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>
            {/* Map Test */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-gray-900">
          Map Test
        </h2>

        <BloomMap className="h-[400px]" />
      </div>
    </div>
  );
}