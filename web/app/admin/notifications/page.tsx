'use client';

import { useState } from 'react';

type NotificationType =
  | 'application'
  | 'booking'
  | 'payment'
  | 'system';

type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'application',
    title: 'New Provider Application',
    message:
      'A new service provider has submitted an application for approval.',
    time: '10 minutes ago',
    read: false,
  },
  {
    id: 2,
    type: 'booking',
    title: 'New Booking',
    message:
      'A customer has created a new appointment at Meskerem Salon.',
    time: '35 minutes ago',
    read: false,
  },
  {
    id: 3,
    type: 'payment',
    title: 'Payment Successful',
    message:
      'A booking payment has been successfully completed.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 4,
    type: 'application',
    title: 'Provider Approved',
    message:
      'Meskerem Salon has been approved and is now active on Bloom.',
    time: '2 hours ago',
    read: true,
  },
  {
    id: 5,
    type: 'system',
    title: 'System Update',
    message:
      'Bloom Booking platform settings have been successfully updated.',
    time: 'Yesterday',
    read: true,
  },
];

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState(
    INITIAL_NOTIFICATIONS,
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  function markAsRead(id: number) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification,
      ),
    );
  }

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  }

  function deleteNotification(id: number) {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Stay updated with activity across Bloom Booking.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="rounded-xl bg-[#7042a7] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#613895]"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid gap-5 sm:grid-cols-3">
        <SummaryCard
          label="All Notifications"
          value={notifications.length}
        />

        <SummaryCard
          label="Unread"
          value={unreadCount}
        />

        <SummaryCard
          label="Read"
          value={notifications.length - unreadCount}
        />
      </div>

      {/* Notifications */}
      <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_5px_10px_rgba(0,0,0,0.08)]">
        {notifications.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-[#7042a7]">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   NOTIFICATION ITEM
========================================================= */

function NotificationItem({
  notification,
  onRead,
  onDelete,
}: {
  notification: Notification;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div
      className={`
        group flex flex-col gap-4 p-5 transition
        sm:flex-row sm:items-center
        ${
          notification.read
            ? 'bg-white'
            : 'bg-[#faf7ff]'
        }
        hover:bg-gray-50
      `}
    >
      {/* Icon */}
      <div
        className={`
          flex h-12 w-12 shrink-0 items-center justify-center
          rounded-2xl
          ${getIconBackground(notification.type)}
        `}
      >
        <NotificationIcon type={notification.type} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={`text-sm ${
              notification.read
                ? 'font-semibold text-gray-800'
                : 'font-bold text-gray-900'
            }`}
          >
            {notification.title}
          </h3>

          {!notification.read && (
            <span className="h-2 w-2 rounded-full bg-[#7042a7]" />
          )}
        </div>

        <p className="mt-1 text-sm leading-6 text-gray-500">
          {notification.message}
        </p>

        <p className="mt-2 text-xs text-gray-400">
          {notification.time}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {!notification.read && (
          <button
            type="button"
            onClick={() => onRead(notification.id)}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-[#7042a7] hover:bg-[#f0e9f8]"
          >
            Mark read
          </button>
        )}

        <button
          type="button"
          onClick={() => onDelete(notification.id)}
          className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-400 hover:bg-red-50 hover:text-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0e9f8] text-[#7042a7]">
        <BellIcon />
      </div>

      <h2 className="mt-5 text-lg font-bold text-gray-900">
        No notifications
      </h2>

      <p className="mt-2 max-w-sm text-sm text-gray-500">
        You're all caught up. New Bloom Booking activity will
        appear here.
      </p>
    </div>
  );
}

/* =========================================================
   ICON HELPERS
========================================================= */

function getIconBackground(type: NotificationType) {
  switch (type) {
    case 'application':
      return 'bg-purple-100 text-[#7042a7]';

    case 'booking':
      return 'bg-blue-100 text-blue-600';

    case 'payment':
      return 'bg-green-100 text-green-600';

    case 'system':
      return 'bg-orange-100 text-orange-600';
  }
}

function NotificationIcon({
  type,
}: {
  type: NotificationType;
}) {
  if (type === 'application') {
    return (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 7h8M8 11h8M8 15h5" />
      </svg>
    );
  }

  if (type === 'booking') {
    return (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18" />
        <path d="M8 14h3M8 17h5" />
      </svg>
    );
  }

  if (type === 'payment') {
    return (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18M7 15h4" />
      </svg>
    );
  }

  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      className="h-7 w-7"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
      <path d="M10 21h4" />
    </svg>
  );
}