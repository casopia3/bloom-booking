import { BookingType, BookingStatus } from '@prisma/client';

const TERMINAL_STATUSES: BookingStatus[] = [
  BookingStatus.COMPLETED,
  BookingStatus.DECLINED,
  BookingStatus.CANCELLED_BY_CUSTOMER,
  BookingStatus.CANCELLED_BY_PROVIDER,
  BookingStatus.NO_SHOW,
];

// Forward-progress chains per booking type, per blueprint Section I.
const STANDARD_CHAIN: BookingStatus[] = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED];

const VIP_CHAIN: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.SPECIALIST_ASSIGNED,
  BookingStatus.ON_THE_WAY,
  BookingStatus.IN_PROGRESS,
  BookingStatus.COMPLETED,
];

/**
 * Returns true only if moving from `from` to `to` is a legal transition for
 * the given booking type. Used by BookingsService before every status
 * change — nothing writes a status directly without going through this.
 */
export function isValidBookingTransition(
  bookingType: BookingType,
  from: BookingStatus,
  to: BookingStatus,
): boolean {
  if (TERMINAL_STATUSES.includes(from)) return false; // nothing leaves a terminal state

  // Cancellation/no-show are allowed from any non-terminal state, per
  // blueprint's cancellation policy (free cancel up to 24h before —
  // the 24h window itself is enforced by the caller, not here).
  if (
    to === BookingStatus.CANCELLED_BY_CUSTOMER ||
    to === BookingStatus.CANCELLED_BY_PROVIDER ||
    to === BookingStatus.NO_SHOW
  ) {
    return true;
  }

  if (to === BookingStatus.DECLINED) {
    return from === BookingStatus.PENDING; // only a pending request can be declined
  }

  const chain = bookingType === BookingType.VIP_HOME ? VIP_CHAIN : STANDARD_CHAIN;
  const fromIndex = chain.indexOf(from);
  const toIndex = chain.indexOf(to);

  if (fromIndex === -1 || toIndex === -1) return false;
  return toIndex === fromIndex + 1; // only one forward step at a time — no skipping stages
}
