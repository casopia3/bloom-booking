import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';

interface RequestingUser {
  userId: string;
  role: UserRole;
}

// Same haversine formula used in bookings.service.ts for VIP radius
// checks. Duplicated here rather than silently left unbuilt — worth
// extracting to a shared util once a third use case shows up.
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  private get prismaClient(): any {
    return this.prisma as any;
  }

  // ── Public browse (customers) ───────────────────────────
  // Only verified + enabled providers are visible to customers.
  // Now supports real search (name/address), real category filtering
  // (via a provider's services), and real distance-based sorting when
  // the customer's coordinates are known — replacing what were
  // previously decorative, non-functional frontend-only pieces.
  async findAll(params: { search?: string; category?: string; lat?: number; lng?: number } = {}) {
    const { search, category, lat, lng } = params;

    const where: any = { isVerified: true, isEnabled: true };

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      // Case-insensitive exact match against any of the provider's
      // services — category is free-text (see schema comment), so we
      // don't do partial "contains" matching here to avoid "Hair" also
      // matching "Haircut" in a confusing way.
      where.services = { some: { category: { equals: category, mode: 'insensitive' } } };
    }

    const providers = await this.prismaClient.serviceProvider.findMany({
      where,
      include: { galleryImages: true },
    });

    if (lat == null || lng == null) {
      return providers;
    }

    // Real distance-based sort. Providers without their own coordinates
    // are pushed to the end (still browsable) rather than dropped.
    return providers
      .map((p: any) => ({
        ...p,
        distanceKm:
          p.latitude != null && p.longitude != null ? Number(haversineKm(lat, lng, p.latitude, p.longitude).toFixed(1)) : null,
      }))
      .sort((a: any, b: any) => {
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
  }

  async findOne(id: string) {
    const provider = await this.prismaClient.serviceProvider.findUnique({
      where: { id },
      include: {
        galleryImages: true,
        services: { where: { availableStandard: true } },
        specialists: true,
      },
    });
    if (!provider) throw new NotFoundException('Provider not found');
    return provider;
  }

  // ── Admin-provisioned creation ──────────────────────────
  // Confirmed decision: providers are not self-registered — a super-admin
  // creates the provider profile against an existing user account.
  async create(dto: CreateProviderDto) {
    return this.prismaClient.serviceProvider.create({
      data: {
        adminUserId: dto.adminUserId,
        businessName: dto.businessName,
        about: dto.about,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        supportsVipHome: dto.supportsVipHome ?? false,
        vipServiceRadiusKm: dto.vipServiceRadiusKm,
        vipTravelFee: dto.vipTravelFee,
      },
    });
  }

  // ── Provider-admin self-management (ownership-checked) ──
  async update(providerId: string, dto: UpdateProviderDto, requester: RequestingUser) {
    await this.assertOwnerOrSuperAdmin(providerId, requester);
    return this.prismaClient.serviceProvider.update({
      where: { id: providerId },
      data: dto,
    });
  }

  async addGalleryImage(providerId: string, url: string, requester: RequestingUser) {
    await this.assertOwnerOrSuperAdmin(providerId, requester);
    return this.prismaClient.providerImage.create({
      data: { serviceProviderId: providerId, url },
    });
  }

  async setAvailability(providerId: string, dto: SetAvailabilityDto, requester: RequestingUser) {
    await this.assertOwnerOrSuperAdmin(providerId, requester);

    if (dto.specialistId) {
      const specialist = await this.prismaClient.specialist.findUnique({
        where: { id: dto.specialistId },
      });
      if (!specialist || specialist.serviceProviderId !== providerId) {
        throw new ForbiddenException('Specialist does not belong to this provider');
      }
    }

    return this.prismaClient.availability.create({
      data: {
        serviceProviderId: providerId,
        specialistId: dto.specialistId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        slotMinutes: dto.slotMinutes ?? 30,
        breakStart: dto.breakStart,
        breakEnd: dto.breakEnd,
      },
    });
  }

  async getAvailability(providerId: string) {
    return this.prismaClient.availability.findMany({
      where: { serviceProviderId: providerId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  // ── Admin oversight (SUPER_ADMIN only, enforced via @Roles at controller) ──
  async setEnabled(providerId: string, isEnabled: boolean) {
    return this.prismaClient.serviceProvider.update({
      where: { id: providerId },
      data: { isEnabled },
    });
  }

  async setVerified(providerId: string, isVerified: boolean) {
    return this.prismaClient.serviceProvider.update({
      where: { id: providerId },
      data: { isVerified },
    });
  }

  // ── Shared ownership check ──────────────────────────────
  private async assertOwnerOrSuperAdmin(providerId: string, requester: RequestingUser) {
    if (requester.role === UserRole.SUPER_ADMIN) return;

    const provider = await this.prismaClient.serviceProvider.findUnique({
      where: { id: providerId },
      select: { adminUserId: true },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    if (provider.adminUserId !== requester.userId) {
      throw new ForbiddenException('You do not manage this provider');
    }
  }
}
