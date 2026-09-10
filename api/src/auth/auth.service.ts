import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto, ResendOtpDto } from './dto/verify-otp.dto';
import { RequestPasswordResetDto, ConfirmPasswordResetDto } from './dto/password-reset.dto';

const OTP_TTL_MINUTES = 5;
const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // --- Registration ---
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing) {
      throw new ConflictException('An account with this phone number already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email,
        passwordHash,
        role: UserRole.CUSTOMER, // self-registration is always a customer;
        // provider-admin/specialist/super-admin accounts are provisioned
        // by an existing admin, not via public registration — implementation
        // decision, flagging per spec principle #5.
        customerProfile: { create: { name: dto.name } },
      },
    });

    await this.issueAndStoreOtp(user.id);

    return { userId: user.id, phone: user.phone, message: 'Registered. OTP sent for verification.' };
  }

  // --- OTP verification ---
  private generateOtpCode(): string {
    return crypto.randomInt(100000, 999999).toString(); // 6-digit code
  }

  private async issueAndStoreOtp(userId: string) {
    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: { otpCode: code, otpExpiresAt: expiresAt },
    });

    // TODO: integrate SMS provider to actually deliver `code` to the user's phone.
    // No SMS provider is specified in the original docs or mockup —
    // requires client confirmation per spec principle #5.
    // Logging in dev only; never log OTP codes in production.
    if (this.config.get('NODE_ENV') !== 'production') {
      console.log(`[DEV ONLY] OTP for user ${userId}: ${code}`);
    }
  }

  async resendOtp(dto: ResendOtpDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) throw new NotFoundException('No account found for this phone number');
    await this.issueAndStoreOtp(user.id);
    return { message: 'OTP resent' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) throw new NotFoundException('No account found for this phone number');

    if (!user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException('No OTP requested for this account');
    }
    if (user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP has expired, please request a new one');
    }
    if (user.otpCode !== dto.code) {
      throw new BadRequestException('Invalid OTP code');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true, otpCode: null, otpExpiresAt: null },
    });

    return this.issueTokens(user.id, user.role);
  }

  // --- Login ---
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) throw new UnauthorizedException('Invalid phone number or password');

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException('Invalid phone number or password');

    if (!user.isActive) {
      throw new UnauthorizedException('This account has been disabled. Contact support for assistance.');
    }

    if (!user.phoneVerified) {
      throw new UnauthorizedException('Phone number not verified — please complete OTP verification');
    }

    return this.issueTokens(user.id, user.role);
  }

  private async issueTokens(userId: string, role: UserRole) {
    const payload = { sub: userId, role };
    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRY') ?? '7d',
    });
    return { accessToken, refreshToken };
  }

  // --- Password recovery ---
  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) {
      // Don't reveal whether a phone number is registered.
      return { message: 'If this account exists, a recovery code has been sent' };
    }
    await this.issueAndStoreOtp(user.id); // reuse OTP mechanism for reset codes
    return { message: 'If this account exists, a recovery code has been sent' };
  }

  async confirmPasswordReset(dto: ConfirmPasswordResetDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) throw new NotFoundException('No account found for this phone number');

    if (!user.otpCode || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestException('Recovery code is invalid or has expired');
    }
    if (user.otpCode !== dto.code) {
      throw new BadRequestException('Invalid recovery code');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, otpCode: null, otpExpiresAt: null },
    });

    return { message: 'Password reset successful' };
  }
}
