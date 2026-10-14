
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  ProviderApplicationStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
import { CreateProviderApplicationDto } from './dto/create-provider-application.dto';
import { ClaimProviderAccountDto } from './dto/claim-provider-account.dto';

const OTP_TTL_MINUTES = 5;
const SALT_ROUNDS = 10;

@Injectable()
export class ProviderApplicationsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private smsService: SmsService,
  ) {}

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

  async findAll(status?: ProviderApplicationStatus) {
    return this.prisma.providerApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const application =
      await this.prisma.providerApplication.findUnique({
        where: { id },
      });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async approve(id: string) {
    const application = await this.findOne(id);

    if (application.status !== ProviderApplicationStatus.PENDING) {
      throw new BadRequestException(
        'Only pending applications can be approved',
      );
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

    // Save approval before attempting SMS delivery.
    const approvedApplication =
      await this.prisma.providerApplication.update({
        where: { id },
        data: {
          status: ProviderApplicationStatus.APPROVED,
          createdUserId: user.id,
        },
      });

    let claimSmsSent = false;

    try {
      await this.issueClaimCode(user.id);
      claimSmsSent = true;
    } catch {
      // The application remains approved. Super Admin can retry.
      console.error(
        'Provider claim SMS failed. Use the resend claim code endpoint.',
      );
    }

    return {
      ...approvedApplication,
      claimSmsSent,
      claimMessage: claimSmsSent
        ? 'Provider approved and claim code SMS accepted by the SMS provider.'
        : 'Provider approved, but SMS delivery could not be initiated. Resend the claim code.',
    };
  }

  async resendClaimCode(id: string) {
    const application = await this.findOne(id);

    if (application.status !== ProviderApplicationStatus.APPROVED) {
      throw new BadRequestException(
        'Only approved applications can receive a claim code',
      );
    }

    if (!application.createdUserId) {
      throw new BadRequestException(
        'No provider account is linked to this application',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: application.createdUserId },
      select: {
        id: true,
        phoneVerified: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'Provider account associated with this application was not found',
      );
    }

    if (user.phoneVerified) {
      throw new BadRequestException(
        'This account has already been claimed. The provider should sign in.',
      );
    }

    await this.issueClaimCode(user.id);

    return {
      message: 'A new provider claim code was submitted to the SMS provider.',
      sent: true,
    };
  }
    async resendClaimCodeByPhone(phone: string) {
  const message =
    'If this phone number matches an approved, unclaimed provider account, a new claim code will be sent if eligible. Please wait before trying again.';

  const normalizedPhone = phone?.trim();

  if (!normalizedPhone) {
    return { message };
  }

  const user = await this.prisma.user.findUnique({
    where: { phone: normalizedPhone },
    select: {
      id: true,
      role: true,
      phoneVerified: true,
    },
  });

  if (
    !user ||
    user.role !== UserRole.PROVIDER_ADMIN ||
    user.phoneVerified
  ) {
    return { message };
  }

  const application =
    await this.prisma.providerApplication.findFirst({
      where: {
        createdUserId: user.id,
        status: ProviderApplicationStatus.APPROVED,
      },
      select: { id: true },
    });

  if (!application) {
    return { message };
  }

  try {
    await this.issueClaimCode(user.id, true);
  } catch (error) {
    if (
      !(error instanceof HttpException) ||
      error.getStatus() !== HttpStatus.TOO_MANY_REQUESTS
    ) {
      console.error('Public provider claim-code resend failed.');
    }
  }

  return { message };
}
  async reject(id: string) {
    const application = await this.findOne(id);

    if (application.status !== ProviderApplicationStatus.PENDING) {
      throw new BadRequestException(
        'Only pending applications can be rejected',
      );
    }

    return this.prisma.providerApplication.update({
      where: { id },
      data: { status: ProviderApplicationStatus.REJECTED },
    });
  }

  async claimAccount(dto: ClaimProviderAccountDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new NotFoundException(
        'No account found for this phone number',
      );
    }

    if (user.role !== UserRole.PROVIDER_ADMIN) {
      throw new BadRequestException(
        'This claim process is only for provider accounts',
      );
    }

    if (user.phoneVerified) {
      throw new BadRequestException(
        'This account has already been claimed — use Sign In instead',
      );
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException(
        'No claim code was issued for this account',
      );
    }

    if (user.otpExpiresAt < new Date()) {
      throw new BadRequestException(
        'Claim code has expired — contact support for a new one',
      );
    }

    if (user.otpCode !== dto.code) {
      throw new BadRequestException('Invalid claim code');
    }

    const passwordHash = await bcrypt.hash(
      dto.newPassword,
      SALT_ROUNDS,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        phoneVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    return {
      message: 'Account claimed — you can now sign in',
    };
  }

 private async issueClaimCode(
  userId: string,
  enforceCooldown = false,
) {
  const now = new Date();
  const cooldownMs = 60 * 1000;
  const code = crypto.randomInt(100000, 1000000);

  const expiresAt = new Date(
    now.getTime() + OTP_TTL_MINUTES * 60 * 1000,
  );

  const data = {
  otpCode: String(code),
  otpExpiresAt: expiresAt,
  claimCodeLastSentAt: now,
};

if (enforceCooldown) {
  const updated = await this.prisma.user.updateMany({
    where: {
      id: userId,
      phoneVerified: false,
      OR: [
        { claimCodeLastSentAt: null },
        {
          claimCodeLastSentAt: {
            lt: new Date(now.getTime() - cooldownMs),
          },
        },
      ],
    },
    data,
  });

  if (updated.count === 0) {
    throw new HttpException(
      'Please wait before requesting another claim code.',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
} else {
  await this.prisma.user.update({
    where: { id: userId },
    data,
  });
}

  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, phone: true },
  });

  if (!user) {
    throw new NotFoundException('Provider account not found.');
  }

  const msisdn = user.phone.replace(/^\+/, '');

  const message =
    `Bloom Booking: Your provider account claim code is ${code}. ` +
    `It expires in ${OTP_TTL_MINUTES} minutes. Do not share this code.`;

  await this.smsService.sendSms(msisdn, message);

  if (this.config.get('NODE_ENV') !== 'production') {
    console.log(
      `[DEV] Provider claim SMS request completed for user ${user.id}`,
    );
  }
}
}
