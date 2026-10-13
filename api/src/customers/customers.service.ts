// NEW FILE: api/src/customers/customers.service.ts
//
// Previously a stub — "not yet needed independently, covered via auth"
// per earlier progress notes. Now needed for the customer Profile screen,
// which requires a way to read and edit the customer's own name/gender/
// occupation, plus their phone/email (which live on User, not Customer).

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type UpdateCustomerDto = Prisma.CustomerUpdateInput;

interface RequestingUser {
  userId: string;
}

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findMine(requester: RequestingUser) {
    const customer = await this.prisma.customer.findUnique({
      where: { userId: requester.userId },
      include: {
        // Only select the non-sensitive User fields — never passwordHash,
        // OTP fields, or reset tokens.
        user: { select: { phone: true, email: true } },
      },
    });
    if (!customer) throw new NotFoundException('No customer profile found for this account');
    return customer;
  }

  async updateMine(requester: RequestingUser, dto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({ where: { userId: requester.userId } });
    if (!customer) throw new NotFoundException('No customer profile found for this account');

    return this.prisma.customer.update({
      where: { id: customer.id },
      data: dto,
    });
  }
}