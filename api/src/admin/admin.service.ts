import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}
async findAllServices() {
  return this.prisma.service.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      provider: {
        select: {
          id: true,
          businessName: true,
          isEnabled: true,
        },
      },
    },
  });
}
  /** Dashboard-style counts — matches the Phase-1-relevant subset of the
   * stats visible on the original mockup's admin dashboard (product/
   * e-commerce stats deliberately excluded per the blueprint's trim
   * instruction). */
  async getDashboardSummary() {
    const [
      totalCustomers,
      totalProviders,
      totalSpecialists,
      totalServices,
      totalBookings,
      totalCompletedBookings,
    ] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.serviceProvider.count(),
      this.prisma.specialist.count(),
      this.prisma.service.count(),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
    ]);

    return {
      totalCustomers,
      totalProviders,
      totalSpecialists,
      totalServices,
      totalBookings,
      totalCompletedBookings,
    };
  }

  /** Admin view of ALL providers — unlike the public GET /providers,
   * this deliberately does NOT filter by isVerified/isEnabled, since an
   * admin needs to see everything to manage it. */
 async findAllProviders() {
  return this.prisma.serviceProvider.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      galleryImages: true,
      admin: {
        select: {
          id: true,
          phone: true,
          email: true,
          isActive: true,
        },
      },
    },
  });
}
async setProviderEnabled(providerId: string, isEnabled: boolean) {
  const provider = await this.prisma.serviceProvider.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    throw new NotFoundException('Service provider not found');
  }

  return this.prisma.serviceProvider.update({
    where: { id: providerId },
    data: { isEnabled },
    select: {
      id: true,
      businessName: true,
      isEnabled: true,
    },
  });
}
  async findPendingProviders() {
    return this.prisma.serviceProvider.findMany({
      where: { isVerified: false },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findAllCustomers() {
    return this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { phone: true, email: true, isActive: true, createdAt: true } } },
    });
  }

 async findAllSpecialists() {
  return this.prisma.specialist.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      provider: {
        select: {
          businessName: true,
        },
      },
      user: {
        select: {
          id: true,
          phone: true,
          email: true,
          isActive: true,
        },
      },
    },
  });
}

  async findAllPayments() {
    return this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            id: true,
            bookingType: true,
            scheduledAt: true,
            customer: { select: { name: true } },
            provider: { select: { businessName: true } },
          },
        },
      },
    });
  }

  /** Enable/disable ANY user account regardless of role — a customer, a
   * specialist, or a provider-admin. (Provider-level enable/disable, as
   * distinct from the provider-admin's own account, already exists on
   * ServiceProvider via the providers module — this is separate.) */
  async setUserActive(userId: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, phone: true, role: true, isActive: true },
    });
  }
    async findAllPromotions() {
    return this.prisma.promotion.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async createPromotion(data: {
    title: string;
    description?: string;
    discount?: string;
    buttonText?: string;
    category?: string;
    imageUrl?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    sortOrder?: number;
  }) {
    return this.prisma.promotion.create({
      data: {
        title: data.title,
        description: data.description,
        discount: data.discount,
        buttonText: data.buttonText ?? 'Explore',
        category: data.category,
        imageUrl: data.imageUrl,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async updatePromotion(
    id: string,
    data: {
      title?: string;
      description?: string;
      discount?: string;
      buttonText?: string;
      category?: string;
      imageUrl?: string;
      startDate?: string;
      endDate?: string;
      isActive?: boolean;
      sortOrder?: number;
    },
  ) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    return this.prisma.promotion.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        discount: data.discount,
        buttonText: data.buttonText,
        category: data.category,
        imageUrl: data.imageUrl,
        startDate: data.startDate
          ? new Date(data.startDate)
          : undefined,
        endDate: data.endDate
          ? new Date(data.endDate)
          : undefined,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
  }

  async deletePromotion(id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    return this.prisma.promotion.delete({
      where: { id },
    });
  }
}
