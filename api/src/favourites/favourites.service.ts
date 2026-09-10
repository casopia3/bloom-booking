import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavouritesService {
  constructor(private prisma: PrismaService) {}

  // Favourite is keyed by Customer.id, but the JWT only carries User.id —
  // resolve the Customer profile for the requesting user on every call.
  private async getCustomerIdForUser(userId: string): Promise<string> {
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!customer) {
      throw new NotFoundException('No customer profile found for this account');
    }
    return customer.id;
  }

  async list(userId: string) {
    const customerId = await this.getCustomerIdForUser(userId);
    return this.prisma.favourite.findMany({
      where: { customerId },
      include: { serviceProvider: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, serviceProviderId: string) {
    const customerId = await this.getCustomerIdForUser(userId);

    const provider = await this.prisma.serviceProvider.findUnique({
      where: { id: serviceProviderId },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    const existing = await this.prisma.favourite.findUnique({
      where: { customerId_serviceProviderId: { customerId, serviceProviderId } },
    });
    if (existing) {
      throw new ConflictException('Provider is already in favourites');
    }

    return this.prisma.favourite.create({
      data: { customerId, serviceProviderId },
    });
  }

  async remove(userId: string, serviceProviderId: string) {
    const customerId = await this.getCustomerIdForUser(userId);

    const existing = await this.prisma.favourite.findUnique({
      where: { customerId_serviceProviderId: { customerId, serviceProviderId } },
    });
    if (!existing) throw new NotFoundException('Favourite not found');

    await this.prisma.favourite.delete({ where: { id: existing.id } });
    return { message: 'Removed from favourites' };
  }
}
