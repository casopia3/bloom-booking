import { BookingStatus } from '@/lib/api';

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; text: string }> = {
  [BookingStatus.PENDING]: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700' },
  [BookingStatus.CONFIRMED]: { label: 'Confirmed', bg: 'bg-green-50', text: 'text-green-700' },
  [BookingStatus.SPECIALIST_ASSIGNED]: { label: 'Specialist assigned', bg: 'bg-blue-50', text: 'text-blue-700' },
  [BookingStatus.ON_THE_WAY]: { label: 'On the way', bg: 'bg-purple-50', text: 'text-purple-700' },
  [BookingStatus.IN_PROGRESS]: { label: 'In progress', bg: 'bg-bloom-50', text: 'text-bloom-700' },
  [BookingStatus.COMPLETED]: { label: 'Completed', bg: 'bg-gray-100', text: 'text-gray-700' },
  [BookingStatus.DECLINED]: { label: 'Declined', bg: 'bg-red-50', text: 'text-red-700' },
  [BookingStatus.CANCELLED_BY_CUSTOMER]: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700' },
  [BookingStatus.CANCELLED_BY_PROVIDER]: { label: 'Cancelled by salon', bg: 'bg-red-50', text: 'text-red-700' },
  [BookingStatus.NO_SHOW]: { label: 'No-show', bg: 'bg-red-50', text: 'text-red-700' },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

export function isUpcoming(status: BookingStatus): boolean {
  return [
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.SPECIALIST_ASSIGNED,
    BookingStatus.ON_THE_WAY,
    BookingStatus.IN_PROGRESS,
  ].includes(status);
}

export function isCancellable(status: BookingStatus): boolean {
  return [
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.SPECIALIST_ASSIGNED,
  ].includes(status);
}
