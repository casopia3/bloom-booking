import { Injectable } from '@nestjs/common';
import { BookingStatus, DayOfWeek } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const DAY_OF_WEEK_MAP: DayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as DayOfWeek[];

// Statuses that hold a slot (block it from being offered again).
// DECLINED/CANCELLED_* bookings free the slot back up.
const SLOT_BLOCKING_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.SPECIALIST_ASSIGNED,
  BookingStatus.ON_THE_WAY,
  BookingStatus.IN_PROGRESS,
  BookingStatus.COMPLETED,
];

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Returns available slot start times (as "HH:mm" strings) for a given
   * provider (and optionally a specific specialist) on a given date, for a
   * service of the given duration.
   *
   * Priority: specialist-specific Availability overrides provider-default
   * Availability for that day, per the architecture doc's design.
   */
  async getAvailableSlots(params: {
    serviceProviderId: string;
    specialistId?: string | null;
    date: Date;
    durationMin: number;
  }): Promise<string[]> {
    const { serviceProviderId, specialistId, date, durationMin } = params;
    const dayOfWeek = DAY_OF_WEEK_MAP[date.getDay()];

    // 1. Check for a full-day block first — short-circuits everything else.
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const blockedDates = await this.prisma.blockedDate.findMany({
      where: {
        date: { gte: dayStart, lte: dayEnd },
        OR: [
          { serviceProviderId, specialistId: specialistId ?? undefined },
          specialistId ? { specialistId } : { serviceProviderId, specialistId: null },
        ],
      },
    });
    if (blockedDates.some((b) => !b.startTime && !b.endTime)) {
      return []; // whole day blocked
    }

    // 2. Fetch working hours — prefer specialist-specific override, fall back
    // to provider-wide default.
    let availability = specialistId
      ? await this.prisma.availability.findFirst({
          where: { serviceProviderId, specialistId, dayOfWeek },
        })
      : null;

    if (!availability) {
      availability = await this.prisma.availability.findFirst({
        where: { serviceProviderId, specialistId: null, dayOfWeek },
      });
    }

    if (!availability) return []; // not open that day

    const openMin = timeToMinutes(availability.startTime);
    const closeMin = timeToMinutes(availability.endTime);
    const breakStartMin = availability.breakStart ? timeToMinutes(availability.breakStart) : null;
    const breakEndMin = availability.breakEnd ? timeToMinutes(availability.breakEnd) : null;
    const slotSize = availability.slotMinutes;

    // 3. Existing bookings that occupy time on this date for this
    // provider/specialist — used to exclude already-taken slots.
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        serviceProviderId,
        specialistId: specialistId ?? undefined,
        scheduledAt: { gte: dayStart, lte: dayEnd },
        status: { in: SLOT_BLOCKING_STATUSES },
      },
      select: { scheduledAt: true, durationMin: true },
    });

    const bookedRanges = existingBookings.map((b) => {
      const start = b.scheduledAt.getHours() * 60 + b.scheduledAt.getMinutes();
      return { start, end: start + b.durationMin };
    });

    // 4. Partial-day blocks for this date.
    const partialBlocks = blockedDates
      .filter((b) => b.startTime && b.endTime)
      .map((b) => ({ start: timeToMinutes(b.startTime!), end: timeToMinutes(b.endTime!) }));

    // 5. Generate candidate slots and filter out anything that overlaps a
    // break, a blocked window, an existing booking, or runs past closing time.
    const slots: string[] = [];
    for (let start = openMin; start + durationMin <= closeMin; start += slotSize) {
      const end = start + durationMin;

      const overlapsBreak =
        breakStartMin !== null && breakEndMin !== null && start < breakEndMin && end > breakStartMin;
      const overlapsBooking = bookedRanges.some((r) => start < r.end && end > r.start);
      const overlapsBlock = partialBlocks.some((r) => start < r.end && end > r.start);

      if (!overlapsBreak && !overlapsBooking && !overlapsBlock) {
        slots.push(minutesToTime(start));
      }
    }

    return slots;
  }
}
