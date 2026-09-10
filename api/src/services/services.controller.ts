import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

type AuthUser = { userId: string; role: UserRole };

@Controller()
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  // ── Public — customer browsing ──────────────────────────
  @Get('providers/:providerId/services')
  findAllForProvider(@Param('providerId') providerId: string) {
    return this.servicesService.findAllForProvider(providerId);
  }

  @Get('services/:id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  // ── Provider-admin manages their own services ───────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER_ADMIN, UserRole.SUPER_ADMIN)
  @Post('providers/:providerId/services')
  create(
    @Param('providerId') providerId: string,
    @Body() dto: CreateServiceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.servicesService.create(providerId, dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER_ADMIN, UserRole.SUPER_ADMIN)
  @Patch('services/:id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto, @CurrentUser() user: AuthUser) {
    return this.servicesService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER_ADMIN, UserRole.SUPER_ADMIN)
  @Delete('services/:id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.servicesService.remove(id, user);
  }
}
