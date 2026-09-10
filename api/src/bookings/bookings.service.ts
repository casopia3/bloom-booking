import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { BookingType, BookingStatus, UserRole, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AvailabilityService } from './availability.service';
import { BookingLockService } from './booking-lock.service';
import { NotificationsService } from '../notifications/notifications.service';
import { isValidBookingTransition } from './booking-status.state-machine';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  CancelBookingDto,
  RescheduleBookingDto,
  AssignSpecialistDto,
  UpdateBookingStatusDto,
} from './dto/booking-actions.dto';

interface RequestingUser {
  userId: string;
  role: UserRole;
}

const FREE_CANCEL_WINDOW_HOURS = 24; // [CONFIRMED] per blueprint Section I

// Haversine distance in km — used for VIP service-area radius validation.
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private availability: AvailabilityService,
    private lock: BookingLockService,
    private notifications: NotificationsService,
  ) {}

  async create(dto: CreateBookingDto, requester: RequestingUser) {
    const customer = await this.prisma.customer.findUnique({ where: { userId: requester.userId } });
    if (!customer) throw new ForbiddenException('Only customers can create bookings');

    const provider = await this.prisma.serviceProvider.findUnique({ where: { id: dto.serviceProviderId } });
    if (!provider || !provider.isEnabled) throw new NotFoundException('Provider not found or not active');

    const services = await this.prisma.service.findMany({
      where: { id: { in: dto.serviceIds }, serviceProviderId: dto.serviceProviderId },
    });
    if (services.length !== dto.serviceIds.length) {
      throw new BadRequestException('One or more services do not belong to this provider');
    }

    const isVip = dto.bookingType === BookingType.VIP_HOME;
    const eligibilityFlag = isVip ? 'availableVip' : 'availableStandard';
    const ineligible = services.find((s) => !s[eligibilityFlag]);
    if (ineligible) {
      throw new BadRequestException(`Service "${ineligible.name}" is not available for ${dto.bookingType} booking`);
    }

    let specialist = null;
    if (dto.specialistId) {
      specialist = await this.prisma.specialist.findUnique({ where: { id: dto.specialistId } });
      if (!specialist || specialist.serviceProviderId !== dto.serviceProviderId) {
        throw new BadRequestException('Specialist does not belong to this provider');
      }

      const specialistServiceLinks = await this.prisma.specialistService.findMany({
        where: { specialistId: dto.specialistId, serviceId: { in: dto.serviceIds } },
      });
      if (specialistServiceLinks.length !== dto.serviceIds.length) {
        throw new BadRequestException('Specialist is not assigned to one or more requested services');
      }
    }

    // --- VIP-specific validation ---
    let vipTravelFee: number | null = null;
    if (isVip) {
      if (!provider.supportsVipHome) {
        throw new BadRequestException('This provider does not offer VIP Home Service');
      }
      if (!dto.specialistId) {
        throw new BadRequestException('A specialist must be selected for VIP Home Service');
      }
      if (!specialist!.supportsVipHome) {
        throw new BadRequestException('Selected specialist does not offer VIP Home Service');
      }
      if (!dto.location) {
        throw new BadRequestException('Location is required for VIP Home Service');
      }
      if (provider.latitude != null && provider.longitude != null && provider.vipServiceRadiusKm != null) {
        const distance = distanceKm(provider.latitude, provider.longitude, dto.location.latitude, dto.location.longitude);
        if (distance > provider.vipServiceRadiusKm) {
          throw new BadRequestException(
            `Location is outside this provider's VIP service area (${provider.vipServiceRadiusKm}km radius)`,
          );
        }
      }
      vipTravelFee = provider.vipTravelFee ? Number(provider.vipTravelFee) : 0;
    }

    const durationMin = services.reduce((sum, s) => sum + s.durationMin, 0);
    const servicesSubtotal = services.reduce((sum, s) => sum + Number(s.price), 0);
    const totalPrice = servicesSubtotal + (vipTravelFee ?? 0);
    const scheduledAt = new Date(dto.scheduledAt);

    // --- Concurrency-critical section: acquire lock, re-verify, create ---
    const lockToken = await this.lock.acquire(dto.serviceProviderId, dto.specialistId ?? null, scheduledAt);
    if (!lockToken) {
      throw new ConflictException('slot no longer available');
    }

    try {
      const slotTime = `${scheduledAt.getHours().toString().padStart(2, '0')}:${scheduledAt
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      const openSlots = await this.availability.getAvailableSlots({
        serviceProviderId: dto.serviceProviderId,
        specialistId: dto.specialistId ?? null,
        date: scheduledAt,
        durationMin,
      });
      if (!openSlots.includes(slotTime)) {
        throw new ConflictException('slot no longer available');
      }

      const booking = await this.prisma.$transaction(async (tx) => {
        const created = await tx.booking.create({
          data: {
            customerId: customer.id,
            serviceProviderId: dto.serviceProviderId,
            specialistId: dto.specialistId,
            bookingType: dto.bookingType,
            scheduledAt,
            durationMin,
            servicesSubtotal,
            vipTravelFee: vipTravelFee ?? undefined,
            totalPrice,
            note: dto.note,
            status: BookingStatus.PENDING,
            services: {
              create: dto.serviceIds.map((serviceId) => ({
                serviceId,
                priceAtBooking: services.find((s) => s.id === serviceId)!.price,
              })),
            },
          },
        });

        if (isVip && dto.location) {
          await tx.bookingLocation.create({
            data: {
              bookingId: created.id,
              address: dto.location.address,
              latitude: dto.location.latitude,
              longitude: dto.location.longitude,
              instructions: dto.location.instructions,
            },
          });
        }

        await tx.payment.create({
          data: { bookingId: created.id, amount: totalPrice },
        });

        return created;
      });

      // Notify the provider-admin that a new booking request came in.
      await this.notifications.notify({
        userId: provider.adminUserId,
        type: NotificationType.BOOKING_CREATED,
        title: 'New booking request',
        body: `A new ${dto.bookingType} booking was requested for ${scheduledAt.toLocaleString()}`,
        relatedBookingId: booking.id,
      });

      return this.findOne(booking.id, requester);
    } finally {
      await this.lock.release(dto.serviceProviderId, dto.specialistId ?? null, scheduledAt, lockToken);
    }
  }

  async findOne(bookingId: string, requester: RequestingUser) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        services: { include: { service: true } },
        location: true,
        payment: true,
        review: true,
        customer: true,
        specialist: true,
        provider: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    await this.assertCanView(booking, requester);
    return booking;
  }

  async findMany(
    filters: { customerId?: string; serviceProviderId?: string; specialistId?: string },
    requester: RequestingUser,
  ) {
    const where = await this.buildAuthorizedWhere(filters, requester);
    return this.prisma.booking.findMany({
      where,
      include: { services: { include: { service: true } }, location: true },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async cancel(bookingId: string, dto: CancelBookingDto, requester: RequestingUser) {
    const booking = await this.getBookingOr404(bookingId);
    const isCustomer = await this.isOwningCustomer(booking.customerId, requester);
    const isProvider = await this.isOwningProviderAdmin(booking.serviceProviderId, requester);

    if (!isCustomer && !isProvider && requester.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('You cannot cancel this booking');
    }

    const targetStatus = isProvider ? BookingStatus.CANCELLED_BY_PROVIDER : BookingStatus.CANCELLED_BY_CUSTOMER;
    if (!isValidBookingTransition(booking.bookingType, booking.status, targetStatus)) {
      throw new BadRequestException(`Cannot cancel a booking with status ${booking.status}`);
    }

    const hoursUntil = (booking.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);
    const withinNoRefundWindow = hoursUntil < FREE_CANCEL_WINDOW_HOURS;

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: targetStatus,
        cancelledAt: new Date(),
        cancellationReason: dto.reason ?? (withinNoRefundWindow ? 'Cancelled within 24h window (no refund)' : undefined),
      },
    });

    // Notify whichever party did NOT initiate the cancellation.
    if (isProvider) {
      const customer = await this.prisma.customer.findUnique({ where: { id: booking.customerId } });
      if (customer) {
        await this.notifications.notify({
          userId: customer.userId,
          type: NotificationType.BOOKING_CANCELLED,
          title: 'Booking cancelled by salon',
          body: dto.reason ?? 'Your booking was cancelled by the provider.',
          relatedBookingId: booking.id,
        });
      }
    } else {
      const provider = await this.prisma.serviceProvider.findUnique({ where: { id: booking.serviceProviderId } });
      if (provider) {
        await this.notifications.notify({
          userId: provider.adminUserId,
          type: NotificationType.BOOKING_CANCELLED,
          title: 'Booking cancelled by customer',
          body: dto.reason ?? 'A customer cancelled their booking.',
          relatedBookingId: booking.id,
        });
      }
    }

    return updated;
  }

  async reschedule(bookingId: string, dto: RescheduleBookingDto, requester: RequestingUser) {
    const booking = await this.getBookingOr404(bookingId);
    const isCustomer = await this.isOwningCustomer(booking.customerId, requester);
    const isProvider = await this.isOwningProviderAdmin(booking.serviceProviderId, requester);
    if (!isCustomer && !isProvider && requester.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('You cannot reschedule this booking');
    }

    const terminalStatuses: BookingStatus[] = [
      BookingStatus.COMPLETED,
      BookingStatus.CANCELLED_BY_CUSTOMER,
      BookingStatus.CANCELLED_BY_PROVIDER,
      BookingStatus.DECLINED,
      BookingStatus.NO_SHOW,
    ];
    if (terminalStatuses.includes(booking.status)) {
      throw new BadRequestException(`Cannot reschedule a booking with status ${booking.status}`);
    }

    const newScheduledAt = new Date(dto.newScheduledAt);
    const lockToken = await this.lock.acquire(booking.serviceProviderId, booking.specialistId, newScheduledAt);
    if (!lockToken) throw new ConflictException('slot no longer available');

    try {
      const slotTime = `${newScheduledAt.getHours().toString().padStart(2, '0')}:${newScheduledAt
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      const openSlots = await this.availability.getAvailableSlots({
        serviceProviderId: booking.serviceProviderId,
        specialistId: booking.specialistId,
        date: newScheduledAt,
        durationMin: booking.durationMin,
      });
      if (!openSlots.includes(slotTime)) throw new ConflictException('slot no longer available');

      return await this.prisma.booking.update({
        where: { id: bookingId },
        data: { scheduledAt: newScheduledAt },
      });
    } finally {
      await this.lock.release(booking.serviceProviderId, booking.specialistId, newScheduledAt, lockToken);
    }
  }

  async assignSpecialist(bookingId: string, dto: AssignSpecialistDto, requester: RequestingUser) {
    const booking = await this.getBookingOr404(bookingId);
    const isProvider = await this.isOwningProviderAdmin(booking.serviceProviderId, requester);
    if (!isProvider && requester.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only the provider can assign a specialist');
    }

    const specialist = await this.prisma.specialist.findUnique({ where: { id: dto.specialistId } });
    if (!specialist || specialist.serviceProviderId !== booking.serviceProviderId) {
      throw new BadRequestException('Specialist does not belong to this provider');
    }

    const nextStatus =
      booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED
        ? BookingStatus.SPECIALIST_ASSIGNED
        : booking.status;

    if (nextStatus !== booking.status && !isValidBookingTransition(booking.bookingType, booking.status, nextStatus)) {
      throw new BadRequestException(`Cannot assign a specialist to a booking with status ${booking.status}`);
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { specialistId: dto.specialistId, status: nextStatus },
    });

    await this.notifications.notify({
      userId: specialist.userId,
      type: NotificationType.BOOKING_ASSIGNED,
      title: 'New appointment assigned',
      body: `You've been assigned a booking on ${booking.scheduledAt.toLocaleString()}`,
      relatedBookingId: booking.id,
    });

    return updated;
  }

  async updateStatus(bookingId: string, dto: UpdateBookingStatusDto, requester: RequestingUser) {
    const booking = await this.getBookingOr404(bookingId);

    const isCustomer = await this.isOwningCustomer(booking.customerId, requester);
    const isProvider = await this.isOwningProviderAdmin(booking.serviceProviderId, requester);
    const isSpecialist = booking.specialistId
      ? await this.isAssignedSpecialist(booking.specialistId, requester)
      : false;

    if (!isCustomer && !isProvider && !isSpecialist && requester.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('You do not have permission to update this booking');
    }

    if (!isValidBookingTransition(booking.bookingType, booking.status, dto.status)) {
      throw new BadRequestException(`Cannot move booking from ${booking.status} to ${dto.status}`);
    }

    const updated = await this.prisma.booking.update({ where: { id: bookingId }, data: { status: dto.status } });

    // Notify the customer on the two milestones they most care about.
    if (dto.status === BookingStatus.CONFIRMED || dto.status === BookingStatus.COMPLETED) {
      const customer = await this.prisma.customer.findUnique({ where: { id: booking.customerId } });
      if (customer) {
        await this.notifications.notify({
          userId: customer.userId,
          type:
            dto.status === BookingStatus.CONFIRMED
              ? NotificationType.BOOKING_CONFIRMED
              : NotificationType.BOOKING_COMPLETED,
          title: dto.status === BookingStatus.CONFIRMED ? 'Booking confirmed' : 'Booking completed',
          body:
            dto.status === BookingStatus.CONFIRMED
              ? 'Your booking has been confirmed.'
              : 'Your booking is complete — leave a review!',
          relatedBookingId: booking.id,
        });
      }
    }

    return updated;
  }

  // --- Authorization helpers ---

  private async getBookingOr404(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  private async isOwningCustomer(customerId: string, requester: RequestingUser): Promise<boolean> {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    return customer?.userId === requester.userId;
  }

  private async isOwningProviderAdmin(serviceProviderId: string, requester: RequestingUser): Promise<boolean> {
    if (requester.role !== UserRole.PROVIDER_ADMIN) return false;
    const provider = await this.prisma.serviceProvider.findUnique({ where: { id: serviceProviderId } });
    return provider?.adminUserId === requester.userId;
  }

  private async isAssignedSpecialist(specialistId: string, requester: RequestingUser): Promise<boolean> {
    const specialist = await this.prisma.specialist.findUnique({ where: { id: specialistId } });
    return specialist?.userId === requester.userId;
  }

  private async assertCanView(booking: { customerId: string; serviceProviderId: string; specialistId: string | null }, requester: RequestingUser) {
    if (requester.role === UserRole.SUPER_ADMIN) return;
    if (await this.isOwningCustomer(booking.customerId, requester)) return;
    if (await this.isOwningProviderAdmin(booking.serviceProviderId, requester)) return;
    if (booking.specialistId && (await this.isAssignedSpecialist(booking.specialistId, requester))) return;
    throw new ForbiddenException('You do not have permission to view this booking');
  }

  private async buildAuthorizedWhere(
    filters: { customerId?: string; serviceProviderId?: string; specialistId?: string },
    requester: RequestingUser,
  ) {
    if (requester.role === UserRole.SUPER_ADMIN) return filters;

    if (requester.role === UserRole.CUSTOMER) {
      const customer = await this.prisma.customer.findUnique({ where: { userId: requester.userId } });
      return { ...filters, customerId: customer?.id };
    }

    if (requester.role === UserRole.PROVIDER_ADMIN) {
      const provider = await this.prisma.serviceProvider.findFirst({ where: { adminUserId: requester.userId } });
      return { ...filters, serviceProviderId: provider?.id };
    }

    if (requester.role === UserRole.SPECIALIST) {
      const specialist = await this.prisma.specialist.findUnique({ where: { userId: requester.userId } });
      return { ...filters, specialistId: specialist?.id };
    }

    return filters;
  }
}
