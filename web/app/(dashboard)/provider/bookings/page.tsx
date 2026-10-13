'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { api, ApiError, BookingListItem, BookingStatus, BookingType, Specialist } from '@/lib/api';

type TabKey = 'all' | 'pending' | 'upcoming' | 'completed' | 'cancelled';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const UPCOMING_STATUSES: BookingStatus[] = [
  BookingStatus.CONFIRMED,
  BookingStatus.SPECIALIST_ASSIGNED,
  BookingStatus.ON_THE_WAY,
  BookingStatus.IN_PROGRESS,
];

const CANCELLED_STATUSES: BookingStatus[] = [
  BookingStatus.DECLINED,
  BookingStatus.CANCELLED_BY_CUSTOMER,
  BookingStatus.CANCELLED_BY_PROVIDER,
  BookingStatus.NO_SHOW,
];

const STATUS_STYLE: Record<string, string> = {
  [BookingStatus.PENDING]: 'bg-amber-50 text-amber-700',
  [BookingStatus.CONFIRMED]: 'bg-bloom-100 text-bloom-700',
  [BookingStatus.SPECIALIST_ASSIGNED]: 'bg-bloom-100 text-bloom-700',
  [BookingStatus.ON_THE_WAY]: 'bg-bloom-100 text-bloom-700',
  [BookingStatus.IN_PROGRESS]: 'bg-bloom-100 text-bloom-700',
  [BookingStatus.COMPLETED]: 'bg-green-50 text-green-700',
  [BookingStatus.DECLINED]: 'bg-red-50 text-red-700',
  [BookingStatus.CANCELLED_BY_CUSTOMER]: 'bg-red-50 text-red-700',
  [BookingStatus.CANCELLED_BY_PROVIDER]: 'bg-red-50 text-red-700',
  [BookingStatus.NO_SHOW]: 'bg-red-50 text-red-700',
};

const STANDARD_CHAIN: BookingStatus[] = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED];

const VIP_CHAIN: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.SPECIALIST_ASSIGNED,
  BookingStatus.ON_THE_WAY,
  BookingStatus.IN_PROGRESS,
  BookingStatus.COMPLETED,
];

// Mirrors the backend's isValidBookingTransition chain exactly — only ever
// one forward step at a time, so this always computes the real next stage
// rather than assuming every booking can jump straight to Completed.
function nextStatus(bookingType: BookingType, current: BookingStatus): BookingStatus | null {
  const chain = bookingType === BookingType.VIP_HOME ? VIP_CHAIN : STANDARD_CHAIN;
  const i = chain.indexOf(current);
  if (i === -1 || i === chain.length - 1) return null;
  return chain[i + 1];
}

const NEXT_STATUS_LABEL: Partial<Record<BookingStatus, string>> = {
  [BookingStatus.SPECIALIST_ASSIGNED]: 'Mark as Specialist Assigned',
  [BookingStatus.ON_THE_WAY]: 'Mark as On the Way',
  [BookingStatus.IN_PROGRESS]: 'Mark as In Progress',
  [BookingStatus.COMPLETED]: 'Mark as Completed',
};

function serviceNames(b: BookingListItem) {
  return b.services.map((s) => s.service.name).join(', ');
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function BookingCard({
  booking,
  specialists,
  onChanged,
}: {
  booking: BookingListItem;
  specialists: Specialist[];
  onChanged: () => void;
}) {
  const [actioning, setActioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignId, setAssignId] = useState('');

  const isTerminal =
    booking.status === BookingStatus.COMPLETED || CANCELLED_STATUSES.includes(booking.status);
  const canAssign = !booking.specialist && !isTerminal && booking.status !== BookingStatus.PENDING;
  const next = booking.status !== BookingStatus.PENDING ? nextStatus(booking.bookingType, booking.status) : null;

  async function updateStatus(status: BookingStatus) {
    setActioning(true);
    setError(null);
    try {
      await api.bookings.updateStatus(booking.id, status);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update this booking.');
      setActioning(false);
    }
  }

  async function handleAssign() {
    if (!assignId) return;
    setActioning(true);
    setError(null);
    try {
      await api.bookings.assignSpecialist(booking.id, assignId);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not assign a specialist.');
      setActioning(false);
    }
  }

  async function handleCancel() {
    if (!confirm('Cancel this appointment?')) return;
    setActioning(true);
    setError(null);
    try {
      await api.bookings.cancel(booking.id, {});
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not cancel this booking.');
      setActioning(false);
    }
  }

  return (
    <div className="rounded-card bg-bloom-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display font-semibold text-bloom-700">{booking.customer.name}</p>
          <p className="text-xs text-gray-500">{booking.customer.user.phone}</p>
          <p className="mt-1 truncate text-sm text-gray-600">{serviceNames(booking)}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {formatDateTime(booking.scheduledAt)}
            {booking.bookingType === BookingType.VIP_HOME ? ' · VIP' : ''}
            {booking.specialist ? ` · ${booking.specialist.name}` : ' · Unassigned'}
          </p>
        </div>
        <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[booking.status]}`}>
          {booking.status.replace(/_/g, ' ')}
        </span>
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {booking.status === BookingStatus.PENDING && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => updateStatus(BookingStatus.CONFIRMED)}
            disabled={actioning}
            className="flex-1 rounded-button bg-bloom-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-bloom-600 disabled:opacity-50"
          >
            Accept
          </button>
          <button
            onClick={() => updateStatus(BookingStatus.DECLINED)}
            disabled={actioning}
            className="flex-1 rounded-button bg-white py-2 text-sm font-semibold text-bloom-600 transition-colors hover:bg-bloom-100 disabled:opacity-50"
          >
            Decline
          </button>
        </div>
      )}

      {canAssign && (
        <div className="mt-3 flex gap-2">
          <select
            value={assignId}
            onChange={(e) => setAssignId(e.target.value)}
            className="flex-1 rounded-lg border border-bloom-100 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-bloom-400"
          >
            <option value="">Assign specialist…</option>
            {specialists.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            disabled={actioning || !assignId}
            className="rounded-button bg-bloom-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-bloom-600 disabled:opacity-50"
          >
            Assign
          </button>
        </div>
      )}

      {next && (
        <button
          onClick={() => updateStatus(next)}
          disabled={actioning}
          className="mt-3 w-full rounded-button bg-bloom-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-bloom-600 disabled:opacity-50"
        >
          {NEXT_STATUS_LABEL[next]}
        </button>
      )}

      {!isTerminal && booking.status !== BookingStatus.PENDING && (
        <button
          onClick={handleCancel}
          disabled={actioning}
          className="mt-2 text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
        >
          Cancel appointment
        </button>
      )}
    </div>
  );
}

export default function AppointmentsPage() {
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = await api.providers.getMine();
      const [bookingsData, specialistsData] = await Promise.all([
        api.bookings.listMyBookings(),
        api.providers.getSpecialists(provider.id),
      ]);
      setBookings(bookingsData);
      setSpecialists(specialistsData);
    } catch {
      setError('Could not load appointments right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = bookings;
    if (tab === 'pending') list = list.filter((b) => b.status === BookingStatus.PENDING);
    if (tab === 'upcoming') list = list.filter((b) => UPCOMING_STATUSES.includes(b.status));
    if (tab === 'completed') list = list.filter((b) => b.status === BookingStatus.COMPLETED);
    if (tab === 'cancelled') list = list.filter((b) => CANCELLED_STATUSES.includes(b.status));

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (b) => b.customer.name.toLowerCase().includes(q) || serviceNames(b).toLowerCase().includes(q),
      );
    }

    return [...list].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  }, [bookings, tab, search]);

  return (
    <div>
      <div className="mb-4 rounded-card bg-bloom-100 px-5 py-4">
        <h1 className="font-display text-xl font-bold text-bloom-700">Appointments</h1>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by customer or service"
        className="mb-4 w-full rounded-button border border-bloom-100 bg-white px-4 py-2.5 text-sm outline-none focus:border-bloom-400"
      />

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap rounded-button px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-bloom-500 text-white' : 'bg-bloom-50 text-bloom-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-gray-500">Loading appointments…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && filtered.length === 0 && (
        <p className="text-gray-500">No appointments match this view.</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((b) => (
          <BookingCard key={b.id} booking={b} specialists={specialists} onChanged={load} />
        ))}
      </div>
    </div>
  );
}