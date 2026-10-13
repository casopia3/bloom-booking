'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, Notification } from '@/lib/api';

const TYPE_LABEL: Record<string, string> = {
  BOOKING_CREATED: 'New booking',
  BOOKING_CONFIRMED: 'Booking confirmed',
  BOOKING_ASSIGNED: 'Specialist assigned',
  BOOKING_CANCELLED: 'Booking cancelled',
  BOOKING_COMPLETED: 'Booking completed',
  PAYMENT_RECEIVED: 'Payment received',
  PAYMENT_FAILED: 'Payment failed',
};

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    api.notifications
      .list()
      .then(setNotifications)
      .catch(() => setError('Could not load notifications right now.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleMarkRead(id: string) {
    await api.notifications.markRead(id);
    load();
  }

  async function handleMarkAllRead() {
    await api.notifications.markAllRead();
    load();
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between rounded-card bg-bloom-100 px-5 py-4">
        <h1 className="font-display text-xl font-bold text-bloom-700">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-sm font-semibold text-bloom-600 hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {isLoading && <p className="text-gray-500">Loading notifications…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && notifications.length === 0 && (
        <p className="text-gray-500">You don&apos;t have any notifications yet.</p>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => !n.read && handleMarkRead(n.id)}
            className={`block w-full rounded-card p-4 text-left transition-colors ${
              n.read ? 'bg-white' : 'bg-bloom-50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-bloom-500">
                  {TYPE_LABEL[n.type] ?? n.type}
                </p>
                <p className="mt-0.5 font-display font-semibold text-gray-900">{n.title}</p>
                {n.body && <p className="mt-0.5 text-sm text-gray-600">{n.body}</p>}
              </div>
              {!n.read && <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-bloom-500" />}
            </div>
            <p className="mt-1 text-xs text-gray-400">{timeAgo(n.createdAt)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}