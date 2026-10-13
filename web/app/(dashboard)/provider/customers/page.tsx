'use client';

import { useEffect, useState, useMemo } from 'react';
import { api, BookingListItem } from '@/lib/api';

interface CustomerSummary {
  id: string;
  name: string;
  phone: string;
  bookings: BookingListItem[];
}

function serviceNames(b: BookingListItem) {
  return b.services.map((s) => s.service.name).join(', ');
}

function CustomerCard({ customer }: { customer: CustomerSummary }) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...customer.bookings].sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
  );

  return (
    <div className="rounded-card bg-bloom-50 p-4">
      <button onClick={() => setExpanded((v) => !v)} className="flex w-full items-center justify-between text-left">
        <div>
          <p className="font-display font-semibold text-bloom-700">{customer.name}</p>
          <p className="text-sm text-gray-500">{customer.phone}</p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-bloom-600">
          {customer.bookings.length} booking{customer.bookings.length === 1 ? '' : 's'}
        </span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-bloom-100 pt-3">
          {sorted.map((b) => (
            <div key={b.id} className="rounded-lg bg-white px-3 py-2">
              <p className="text-sm text-gray-700">{serviceNames(b)}</p>
              <p className="text-xs text-gray-400">
                {new Date(b.scheduledAt).toLocaleDateString()} · {b.status.replace(/_/g, ' ')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CustomersPage() {
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.bookings
      .listMyBookings()
      .then(setBookings)
      .catch(() => setError('Could not load your customers right now. Please try again.'))
      .finally(() => setIsLoading(false));
  }, []);

  const customers = useMemo(() => {
    const byId = new Map<string, CustomerSummary>();
    for (const b of bookings) {
      const existing = byId.get(b.customer.id);
      if (existing) {
        existing.bookings.push(b);
      } else {
        byId.set(b.customer.id, {
          id: b.customer.id,
          name: b.customer.name,
          phone: b.customer.user.phone,
          bookings: [b],
        });
      }
    }
    let list = Array.from(byId.values());
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
    }
    return list.sort((a, b) => b.bookings.length - a.bookings.length);
  }, [bookings, search]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 rounded-card bg-bloom-100 px-5 py-4">
        <h1 className="font-display text-xl font-bold text-bloom-700">Customers</h1>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or phone"
        className="mb-4 w-full rounded-button border border-bloom-100 bg-white px-4 py-2.5 text-sm outline-none focus:border-bloom-400"
      />

      {isLoading && <p className="text-gray-500">Loading customers…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && customers.length === 0 && (
        <p className="text-gray-500">No customers have booked with you yet.</p>
      )}

      <div className="space-y-3">
        {customers.map((c) => (
          <CustomerCard key={c.id} customer={c} />
        ))}
      </div>
    </div>
  );
}