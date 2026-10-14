import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProviderApplicationStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ProviderApplicationsService } from './provider-applications.service';
import { CreateProviderApplicationDto } from './dto/create-provider-application.dto';
import { ClaimProviderAccountDto } from './dto/claim-provider-account.dto';

@Controller('provider-applications')
export class ProviderApplicationsController {
  constructor(private service: ProviderApplicationsService) {}

  // ── Public — no auth ─────────────────────────────────────
  @Post()
  apply(@Body() dto: CreateProviderApplicationDto) {
    return this.service.apply(dto);
  }

  @Post('claim-account')
  claimAccount(@Body() dto: ClaimProviderAccountDto) {
    return this.service.claimAccount(dto);
  }
  @Post('resend-claim-code')
resendClaimCodeByPhone(@Body('phone') phone: string) {
  return this.service.resendClaimCodeByPhone(phone);
}
  // ── Super-admin review ───────────────────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  findAll(@Query('status') status?: string) {
    if (status && !Object.values(ProviderApplicationStatus).includes(status as any)) {
      throw new BadRequestException('Invalid status filter');
    }
    return this.service.findAll(status as ProviderApplicationStatus | undefined);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.service.approve(id);
  }

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Post(':id/resend-claim-code')
resendClaimCode(@Param('id') id: string) {
  return this.service.resendClaimCode(id);
}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.service.reject(id);
  }
}