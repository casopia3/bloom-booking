import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ProviderApplicationStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderApplicationDto } from './dto/create-provider-application.dto';
import { ClaimProviderAccountDto } from './dto/claim-provider-account.dto';

const OTP_TTL_MINUTES = 5;
const SALT_ROUNDS = 10;

@Injectable()
export class ProviderApplicationsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  // ── Public: submit an application ─────────────────────────
  async apply(dto: CreateProviderApplicationDto) {
    return this.prisma.providerApplication.create({
      data: {
        businessName: dto.businessName,
        contactName: dto.contactName,
        phone: dto.phone,
        email: dto.email,
        category: dto.category ?? [],
        address: dto.address,
        about: dto.about,
      },
    });
  }

  // ── Super-admin: review queue ──────────────────────────────
  async findAll(status?: ProviderApplicationStatus) {
    return this.prisma.providerApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const application = await this.prisma.providerApplication.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  // ── Super-admin: approve ───────────────────────────────────
  async approve(id: string) {
    const application = await this.findOne(id);
    if (application.status !== ProviderApplicationStatus.PENDING) {
      throw new BadRequestException('Only pending applications can be approved');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { phone: application.phone },
    });
    if (existingUser) {
      throw new ConflictException(
        'An account with this phone number already exists — cannot auto-create a provider account',
      );
    }

    const placeholderHash = await bcrypt.hash(
      crypto.randomBytes(32).toString('hex'),
      SALT_ROUNDS,
    );

    const user = await this.prisma.user.create({
      data: {
        phone: application.phone,
        email: application.email,
        passwordHash: placeholderHash,
        role: UserRole.PROVIDER_ADMIN,
        phoneVerified: false,
      },
    });

    await this.prisma.serviceProvider.create({
      data: {
        adminUserId: user.id,
        businessName: application.businessName,
        about: application.about,
        address: application.address,
         category: application.category,
        isVerified: true,
      },
    });

    await this.issueClaimCode(user.id);

    return this.prisma.providerApplication.update({
      where: { id },
      data: { status: ProviderApplicationStatus.APPROVED, createdUserId: user.id },
    });
  }

  // ── Super-admin: reject ────────────────────────────────────
  async reject(id: string) {
    const application = await this.findOne(id);
    if (application.status !== ProviderApplicationStatus.PENDING) {
      throw new BadRequestException('Only pending applications can be rejected');
    }
    return this.prisma.providerApplication.update({
      where: { id },
      data: { status: ProviderApplicationStatus.REJECTED },
    });
  }

  // ── Public: claim the account created on approval ──────────
  async claimAccount(dto: ClaimProviderAccountDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) throw new NotFoundException('No account found for this phone number');

    if (user.phoneVerified) {
      throw new BadRequestException(
        'This account has already been claimed — use Sign In instead',
      );
    }
    if (!user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException('No claim code was issued for this account');
    }
    if (user.otpExpiresAt < new Date()) {
      throw new BadRequestException('Claim code has expired — contact support for a new one');
    }
    if (user.otpCode !== dto.code) {
      throw new BadRequestException('Invalid claim code');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        phoneVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    return { message: 'Account claimed — you can now sign in' };
  }

  // ── Internal ────────────────────────────────────────────────
  private async issueClaimCode(userId: string) {
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: { otpCode: code, otpExpiresAt: expiresAt },
    });

    if (this.config.get('NODE_ENV') !== 'production') {
      console.log(`[DEV ONLY] Provider account claim code for user ${userId}: ${code}`);
    }
  }
}