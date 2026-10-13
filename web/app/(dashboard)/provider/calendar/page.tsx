'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { api, ApiError, Availability, BookingListItem, DayOfWeek } from '@/lib/api';

const DAY_ORDER: DayOfWeek[] = [
  DayOfWeek.MON,
  DayOfWeek.TUE,
  DayOfWeek.WED,
  DayOfWeek.THU,
  DayOfWeek.FRI,
  DayOfWeek.SAT,
  DayOfWeek.SUN,
];

const DAY_LABEL: Record<DayOfWeek, string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
};

function HoursForm({
  providerId,
  initial,
  onDone,
  onCancel,
}: {
  providerId: string;
  initial?: Availability;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(initial?.dayOfWeek ?? DayOfWeek.MON);
  const [startTime, setStartTime] = useState(initial?.startTime ?? '09:00');
  const [endTime, setEndTime] = useState(initial?.endTime ?? '17:00');
  const [breakStart, setBreakStart] = useState(initial?.breakStart ?? '');
  const [breakEnd, setBreakEnd] = useState(initial?.breakEnd ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        dayOfWeek,
        startTime,
        endTime,
        breakStart: breakStart || undefined,
        breakEnd: breakEnd || undefined,
      };
      if (initial) {
        await api.providers.updateAvailability(providerId, initial.id, payload);
      } else {
        await api.providers.addAvailability(providerId, payload);
      }
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save these hours.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-card bg-bloom-50 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-bloom-700">Day</label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
            className="w-full rounded-lg border border-bloom-100 bg-white px-3 py-2 text-sm outline-none focus:border-bloom-400"
          >
            {DAY_ORDER.map((d) => (
              <option key={d} value={d}>
                {DAY_LABEL[d]}
              </option>
            ))}
          </select>
        </div>
        <div />
        <div>
          <label className="mb-1 block text-xs font-medium text-bloom-700">Opens</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full rounded-lg border border-bloom-100 bg-white px-3 py-2 text-sm outline-none focus:border-bloom-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-bloom-700">Closes</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="w-full rounded-lg border border-bloom-100 bg-white px-3 py-2 text-sm outline-none focus:border-bloom-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-bloom-700">Break start (optional)</label>
          <input
            type="time"
            value={breakStart}
            onChange={(e) => setBreakStart(e.target.value)}
            className="w-full rounded-lg border border-bloom-100 bg-white px-3 py-2 text-sm outline-none focus:border-bloom-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-bloom-700">Break end (optional)</label>
          <input
            type="time"
            value={breakEnd}
            onChange={(e) => setBreakEnd(e.target.value)}
            className="w-full rounded-lg border border-bloom-100 bg-white px-3 py-2 text-sm outline-none focus:border-bloom-400"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-button bg-bloom-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-bloom-600 disabled:opacity-50"
        >
          {saving ? 'Saving…' : initial ? 'Save' : 'Add Hours'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-button bg-white px-5 py-2 text-sm font-semibold text-bloom-600 hover:bg-bloom-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function HoursRow({
  entry,
  providerId,
  onChanged,
}: {
  entry: Availability;
  providerId: string;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm(`Remove ${DAY_LABEL[entry.dayOfWeek]}'s hours?`)) return;
    setDeleting(true);
    setError(null);
    try {
      await api.providers.deleteAvailability(providerId, entry.id);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove these hours.');
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <HoursForm
        providerId={providerId}
        initial={entry}
        onDone={() => {
          setEditing(false);
          onChanged();
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="flex items-center justify-between rounded-card bg-bloom-50 px-4 py-3">
      <div>
        <p className="font-display font-semibold text-bloom-700">{DAY_LABEL[entry.dayOfWeek]}</p>
        <p className="text-sm text-gray-600">
          {entry.startTime} – {entry.endTime}
          {entry.breakStart && entry.breakEnd ? ` (break ${entry.breakStart}–${entry.breakEnd})` : ''}
        </p>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
      <div className="flex gap-3 text-sm font-medium">
        <button onClick={() => setEditing(true)} className="text-bloom-600 hover:underline">
          Edit
        </button>
        <button onClick={handleDelete} disabled={deleting} className="text-red-500 hover:underline disabled:opacity-50">
          Remove
        </button>
      </div>
    </div>
  );
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendarAvailabilityPage() {
  const [providerId, setProviderId] = useState<string | null>(null);
  const [hours, setHours] = useState<Availability[]>([]);
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayIso());

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = await api.providers.getMine();
      setProviderId(provider.id);
      const [hoursData, bookingsData] = await Promise.all([
        api.providers.getAvailability(provider.id),
        api.bookings.listMyBookings(),
      ]);
      // Scoped to provider-wide default hours for this build — a row with
      // specialistId set is a specialist-specific override, not shown here.
      setHours(hoursData.filter((h) => !h.specialistId));
      setBookings(bookingsData);
    } catch {
      setError('Could not load your calendar right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sortedHours = useMemo(
    () => [...hours].sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)),
    [hours],
  );

  const dayBookings = useMemo(
    () => bookings.filter((b) => b.scheduledAt.slice(0, 10) === selectedDate),
    [bookings, selectedDate],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-card bg-bloom-100 px-5 py-4">
        <h1 className="font-display text-xl font-bold text-bloom-700">Calendar & Availability</h1>
      </div>

      {isLoading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && providerId && (
        <>
          {/* Working Hours — real CRUD against the existing Availability endpoints */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-gray-900">Working Hours</h2>
              <button
                onClick={() => setShowAddForm((v) => !v)}
                className="rounded-button bg-bloom-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-bloom-600"
              >
                + Add Hours
              </button>
            </div>

            {showAddForm && (
              <div className="mb-3">
                <HoursForm
                  providerId={providerId}
                  onDone={() => {
                    setShowAddForm(false);
                    load();
                  }}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            )}

            {sortedHours.length === 0 ? (
              <p className="text-sm text-gray-500">No working hours set yet.</p>
            ) : (
              <div className="space-y-2">
                {sortedHours.map((h) => (
                  <HoursRow key={h.id} entry={h} providerId={providerId} onChanged={load} />
                ))}
              </div>
            )}

            <p className="mt-3 text-xs text-gray-400">
              Blocking off specific dates (holidays, time off) isn&apos;t available yet.
            </p>
          </section>

          {/* Calendar — day view of real bookings, computed from existing
              booking data rather than a separate calendar endpoint */}
          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-gray-900">Calendar</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mb-3 rounded-lg border border-bloom-100 bg-white px-3 py-2 text-sm outline-none focus:border-bloom-400"
            />
            {dayBookings.length === 0 ? (
              <p className="text-sm text-gray-500">No appointments on this day.</p>
            ) : (
              <div className="space-y-2">
                {dayBookings.map((b) => (
                  <div key={b.id} className="rounded-card bg-bloom-50 p-3">
                    <p className="font-display font-semibold text-bloom-700">{b.customer.name}</p>
                    <p className="text-sm text-gray-600">{b.services.map((s) => s.service.name).join(', ')}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(b.scheduledAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} ·{' '}
                      {b.status.replace(/_/g, ' ')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}