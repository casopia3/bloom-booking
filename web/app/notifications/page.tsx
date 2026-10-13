'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { api, Notification } from '@/lib/api';

function BellIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'BOOKING_CREATED':
      return '📅';

    case 'BOOKING_CONFIRMED':
      return '✓';

    case 'BOOKING_ASSIGNED':
      return '👤';

    case 'BOOKING_CANCELLED':
      return '×';

    case 'BOOKING_COMPLETED':
      return '✓';

    case 'PAYMENT_RECEIVED':
      return '💳';

    case 'PAYMENT_FAILED':
      return '⚠';

    default:
      return '🔔';
  }
}

function formatNotificationDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    api.notifications
      .list()
      .then(setNotifications)
      .catch(() => {
        setNotifications([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  async function markAsRead(notification: Notification) {
    if (notification.read) return;

    try {
      const updated = await api.notifications.markRead(notification.id);

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? updated : item,
        ),
      );
    } catch {
      // Keep the current notification state if the request fails.
    }
  }

  async function markAllAsRead() {
    if (unreadCount === 0 || markingAll) return;

    setMarkingAll(true);

    try {
      await api.notifications.markAllRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        })),
      );
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <main className="min-h-screen bg-bloom-50/20 pb-10 lg:pl-60">
      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-bloom-50 hover:text-bloom-600"
              aria-label="Go back"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div>
              <h1 className="font-display text-2xl font-semibold text-gray-900 sm:text-3xl">
                Notifications
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount === 1 ? '' : 's'
                    }`
                  : 'You are all caught up'}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={markingAll}
              className="rounded-xl px-3 py-2 text-sm font-medium text-bloom-600 transition hover:bg-bloom-50 disabled:opacity-50"
            >
              {markingAll ? 'Marking...' : 'Mark all as read'}
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="overflow-hidden rounded-2xl border border-bloom-100 bg-white shadow-sm">
          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bloom-50 text-bloom-600">
                <BellIcon className="h-7 w-7" />
              </div>

              <h2 className="mt-4 font-display text-lg font-semibold text-gray-900">
                No notifications yet
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                When you have booking or payment updates, they will appear
                here.
              </p>

              <Link
                href="/"
                className="mt-5 inline-flex rounded-xl bg-bloom-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-bloom-700"
              >
                Explore services
              </Link>
            </div>
          ) : (
            <div>
              {notifications.map((notification, index) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markAsRead(notification)}
                  className={`flex w-full items-start gap-4 px-5 py-5 text-left transition hover:bg-bloom-50/60 sm:px-6 ${
                    index !== notifications.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  } ${
                    !notification.read
                      ? 'bg-bloom-50/30'
                      : 'bg-white'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg ${
                      notification.read
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-bloom-100 text-bloom-700'
                    }`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h2
                        className={`text-sm sm:text-base ${
                          notification.read
                            ? 'font-medium text-gray-800'
                            : 'font-semibold text-gray-900'
                        }`}
                      >
                        {notification.title}
                      </h2>

                      {!notification.read && (
                        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-bloom-500" />
                      )}
                    </div>

                    {notification.body && (
                      <p className="mt-1 text-sm leading-5 text-gray-500">
                        {notification.body}
                      </p>
                    )}

                    <p className="mt-2 text-xs font-medium text-gray-400">
                      {formatNotificationDate(notification.createdAt)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}