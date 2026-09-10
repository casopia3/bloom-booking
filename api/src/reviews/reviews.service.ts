import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { BookingStatus, UserRole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

interface RequestingUser {
  userId: string;
  role: UserRole;
}

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReviewDto, requester: RequestingUser) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { customer: true, review: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    // Only the customer who made the booking can review it.
    if (booking.customer.userId !== requester.userId) {
      throw new ForbiddenException('You can only review your own bookings');
    }

    // Server-side enforcement — completed bookings only. This is the check
    // that actually matters; a UI that only shows the review button on
    // completed bookings is not sufficient on its own, since a direct API
    // call could bypass it entirely.
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Only completed bookings can be reviewed');
    }

    if (booking.review) {
      throw new ConflictException('This booking has already been reviewed');
    }

    // serviceProviderId/specialistId are taken from the booking itself, not
    // from client input — prevents a review from being attributed to a
    // provider or specialist the booking wasn't actually with.
    try {
      return await this.prisma.review.create({
        data: {
          bookingId: booking.id,
          customerId: booking.customerId,
          serviceProviderId: booking.serviceProviderId,
          specialistId: booking.specialistId,
          rating: dto.rating,
          comment: dto.comment,
          photoUrl: dto.photoUrl,
        },
      });
    } catch (err) {
      // Race-condition fallback: two simultaneous review submissions for the
      // same booking would both pass the booking.review check above (read
      // before either write completes), but the schema's @unique on
      // bookingId still protects the database — this just turns that DB
      // error into a clean 409 instead of a raw Prisma exception leaking out.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('This booking has already been reviewed');
      }
      throw err;
    }
  }

  async findByProvider(serviceProviderId: string) {
    return this.prisma.review.findMany({
      where: { serviceProviderId },
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true } } },
    });
  }

  async findBySpecialist(specialistId: string) {
    return this.prisma.review.findMany({
      where: { specialistId },
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true } } },
    });
  }

  /** Matches the "4.8 (1.2k reviews)" pattern visible in the original
   * mobile mockup's provider profile screens. */
  async getProviderRatingSummary(serviceProviderId: string) {
    const result = await this.prisma.review.aggregate({
      where: { serviceProviderId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      average: result._avg.rating ? Number(result._avg.rating.toFixed(1)) : null,
      count: result._count.rating,
    };
  }
}
