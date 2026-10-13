import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpecialistDto } from './dto/create-specialist.dto';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';

const SALT_ROUNDS = 10;

interface RequestingUser {
  userId: string;
  role: UserRole;
}

@Injectable()
export class SpecialistsService {
  constructor(private prisma: PrismaService) {}

  // ── Public browse (customers) ───────────────────────────
  async findAllForProvider(providerId: string) {
    return this.prisma.specialist.findMany({
      where: { serviceProviderId: providerId },
      include: { services: { include: { service: true } } },
    });
  }

  async findOne(id: string) {
    const specialist = await this.prisma.specialist.findUnique({
      where: { id },
      include: { services: { include: { service: true } } },
    });
    if (!specialist) throw new NotFoundException('Specialist not found');
    return specialist;
  }

  // ── Provider-admin manages their own staff ──────────────
  // Creates the User (role SPECIALIST) and the Specialist row together —
  // there is no pre-existing account to attach to, unlike the old shape.
  // Wrapped in a transaction so a failure partway through never leaves a
  // User with no matching Specialist.
  async create(providerId: string, dto: CreateSpecialistDto, requester: RequestingUser) {
    await this.assertProviderOwnerOrSuperAdmin(providerId, requester);

    const existingUser = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existingUser) {
      throw new ConflictException('An account with this phone number already exists');
    }

    const passwordHash = await bcrypt.hash(dto.temporaryPassword, SALT_ROUNDS);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          phone: dto.phone,
          passwordHash,
          role: UserRole.SPECIALIST,
          // Set true immediately: the provider-admin is vouching for this
          // phone number, not the specialist proving ownership via OTP —
          // see the DTO's comment for the reasoning.
          phoneVerified: true,
        },
      });

      return tx.specialist.create({
        data: {
          userId: user.id,
          serviceProviderId: providerId,
          name: dto.name,
          specialty: dto.specialty,
          bio: dto.bio,
          photoUrl: dto.photoUrl,
          supportsVipHome: dto.supportsVipHome ?? false,
        },
      });
    });
  }

  async update(specialistId: string, dto: UpdateSpecialistDto, requester: RequestingUser) {
    const specialist = await this.getOwnedSpecialistOrThrow(specialistId, requester);
    return this.prisma.specialist.update({
      where: { id: specialist.id },
      data: dto,
    });
  }

  async remove(specialistId: string, requester: RequestingUser) {
    const specialist = await this.getOwnedSpecialistOrThrow(specialistId, requester);
    await this.prisma.specialist.delete({ where: { id: specialist.id } });
    return { message: 'Specialist removed' };
  }

  // ── Assign / unassign which services a specialist performs ──
  async assignService(specialistId: string, serviceId: string, requester: RequestingUser) {
    const specialist = await this.getOwnedSpecialistOrThrow(specialistId, requester);

    // Guard: the service must belong to the same provider as the specialist —
    // otherwise a provider-admin could assign a rival salon's service to their staff.
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || service.serviceProviderId !== specialist.serviceProviderId) {
      throw new ForbiddenException('Service does not belong to this specialist\'s provider');
    }

    return this.prisma.specialistService.upsert({
      where: { specialistId_serviceId: { specialistId, serviceId } },
      create: { specialistId, serviceId },
      update: {},
    });
  }

  async unassignService(specialistId: string, serviceId: string, requester: RequestingUser) {
    await this.getOwnedSpecialistOrThrow(specialistId, requester);
    await this.prisma.specialistService.delete({
      where: { specialistId_serviceId: { specialistId, serviceId } },
    });
    return { message: 'Service unassigned' };
  }

  // ── Shared ownership check ──────────────────────────────
  private async getOwnedSpecialistOrThrow(specialistId: string, requester: RequestingUser) {
    const specialist = await this.prisma.specialist.findUnique({ where: { id: specialistId } });
    if (!specialist) throw new NotFoundException('Specialist not found');

    if (requester.role !== UserRole.SUPER_ADMIN) {
      await this.assertProviderOwnerOrSuperAdmin(specialist.serviceProviderId, requester);
    }
    return specialist;
  }

  private async assertProviderOwnerOrSuperAdmin(providerId: string, requester: RequestingUser) {
    if (requester.role === UserRole.SUPER_ADMIN) return;

    const provider = await this.prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: { adminUserId: true },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    if (provider.adminUserId !== requester.userId) {
      throw new ForbiddenException('You do not manage this provider');
    }
  }
}