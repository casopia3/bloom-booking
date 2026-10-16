import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { v2 as cloudinary } from 'cloudinary';
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
  private async getCustomerId(userId: string) {
  const customer = await this.prismaClient.customer.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!customer) {
    throw new NotFoundException('Customer profile not found');
  }

  return customer.id;
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

  // ── Provider-admin self-lookup ──────────────────────────
  // No prior endpoint let a logged-in provider-admin discover their own
  // provider ID — every dashboard screen (services, hours, settings)
  // needs this as a first step.
  async findMine(requester: RequestingUser) {
    const provider = await this.prismaClient.serviceProvider.findFirst({
      where: { adminUserId: requester.userId },
      include: { galleryImages: true },
    });
    if (!provider) throw new NotFoundException('No provider profile found for this account');
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
        category: dto.category ?? [],
        website: dto.website,
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
      data: { ...dto, category: dto.category ?? [] },
    });
  }
async deleteGalleryImage(
  providerId: string,
  imageId: string,
  requester: RequestingUser,
) {
  await this.assertOwnerOrSuperAdmin(providerId, requester);

  const image = await this.prismaClient.providerImage.findFirst({
    where: {
      id: imageId,
      serviceProviderId: providerId,
    },
  });

  if (!image) {
    throw new NotFoundException('Gallery image not found');
  }

  // Older images may not have a Cloudinary public ID.
  if (image.cloudinaryPublicId) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException(
        'Cloud image storage is not configured.',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const result = await cloudinary.uploader.destroy(
      image.cloudinaryPublicId,
      { resource_type: 'image' },
    );

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new InternalServerErrorException(
        'Could not remove the image from cloud storage.',
      );
    }
  }

  await this.prismaClient.providerImage.delete({
    where: { id: imageId },
  });

  return { message: 'Gallery image removed successfully' };
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

  // ── Availability editing/removal ────────────────────────
  // Previously only add (setAvailability) + list (getAvailability)
  // existed — a provider had no way to fix a mistake or remove an old
  // entry without going into the database directly.
  async updateAvailability(
    providerId: string,
    availabilityId: string,
    dto: UpdateAvailabilityDto,
    requester: RequestingUser,
  ) {
    await this.assertOwnerOrSuperAdmin(providerId, requester);

    const existing = await this.prismaClient.availability.findUnique({ where: { id: availabilityId } });
    if (!existing || existing.serviceProviderId !== providerId) {
      throw new NotFoundException('Availability entry not found for this provider');
    }

    return this.prismaClient.availability.update({
      where: { id: availabilityId },
      data: dto,
    });
  }

  async deleteAvailability(providerId: string, availabilityId: string, requester: RequestingUser) {
    await this.assertOwnerOrSuperAdmin(providerId, requester);

    const existing = await this.prismaClient.availability.findUnique({ where: { id: availabilityId } });
    if (!existing || existing.serviceProviderId !== providerId) {
      throw new NotFoundException('Availability entry not found for this provider');
    }

    await this.prismaClient.availability.delete({ where: { id: availabilityId } });
    return { message: 'Availability entry removed' };
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
async addFavourite(providerId: string, userId: string) {
  const customerId = await this.getCustomerId(userId);

  const provider = await this.prismaClient.serviceProvider.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    throw new NotFoundException('Provider not found');
  }

  return this.prismaClient.favourite.upsert({
    where: {
      customerId_serviceProviderId: {
        customerId,
        serviceProviderId: providerId,
      },
    },
    update: {},
    create: {
      customerId,
      serviceProviderId: providerId,
    },
  });
}

async removeFavourite(providerId: string, userId: string) {
  const customerId = await this.getCustomerId(userId);

  const favourite = await this.prismaClient.favourite.findUnique({
    where: {
      customerId_serviceProviderId: {
        customerId,
        serviceProviderId: providerId,
      },
    },
  });

  if (!favourite) {
    throw new NotFoundException('Favourite not found');
  }

  await this.prismaClient.favourite.delete({
    where: {
      customerId_serviceProviderId: {
        customerId,
        serviceProviderId: providerId,
      },
    },
  });

  return { message: 'Favourite removed' };
}

async findMyFavourites(userId: string) {
  const customerId = await this.getCustomerId(userId);

  return this.prismaClient.favourite.findMany({
    where: { customerId },
    include: {
      serviceProvider: {
        include: {
          galleryImages: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async isFavourite(providerId: string, userId: string) {
  const customerId = await this.getCustomerId(userId);

  const favourite = await this.prismaClient.favourite.findUnique({
    where: {
      customerId_serviceProviderId: {
        customerId,
        serviceProviderId: providerId,
      },
    },
  });

  return { isFavourite: !!favourite };
}
}