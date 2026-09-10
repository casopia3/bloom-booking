import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

interface RequestingUser {
  userId: string;
  role: UserRole;
}

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  // ── Public browse (customers) ───────────────────────────
  async findAllForProvider(providerId: string) {
    return this.prisma.service.findMany({
      where: { serviceProviderId: providerId },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { specialists: { include: { specialist: true } } },
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  // ── Provider-admin manages their own services ───────────
  async create(providerId: string, dto: CreateServiceDto, requester: RequestingUser) {
    await this.assertProviderOwnerOrSuperAdmin(providerId, requester);

    return this.prisma.service.create({
      data: {
        serviceProviderId: providerId,
        name: dto.name,
        description: dto.description,
        durationMin: dto.durationMin,
        price: dto.price,
        imageUrl: dto.imageUrl,
        category: dto.category,
        availableStandard: dto.availableStandard ?? true,
        availableVip: dto.availableVip ?? false,
      },
    });
  }

  async update(serviceId: string, dto: UpdateServiceDto, requester: RequestingUser) {
    const service = await this.getOwnedServiceOrThrow(serviceId, requester);
    return this.prisma.service.update({
      where: { id: service.id },
      data: dto,
    });
  }

  async remove(serviceId: string, requester: RequestingUser) {
    const service = await this.getOwnedServiceOrThrow(serviceId, requester);
    await this.prisma.service.delete({ where: { id: service.id } });
    return { message: 'Service removed' };
  }

  // ── Shared ownership check ──────────────────────────────
  private async getOwnedServiceOrThrow(serviceId: string, requester: RequestingUser) {
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundException('Service not found');

    if (requester.role !== UserRole.SUPER_ADMIN) {
      await this.assertProviderOwnerOrSuperAdmin(service.serviceProviderId, requester);
    }
    return service;
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
