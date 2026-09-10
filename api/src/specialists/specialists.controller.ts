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
import { SpecialistsService } from './specialists.service';
import { CreateSpecialistDto } from './dto/create-specialist.dto';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';
import { AssignServiceDto } from './dto/assign-service.dto';

type AuthUser = { userId: string; role: UserRole };

@Controller()
export class SpecialistsController {
  constructor(private specialistsService: SpecialistsService) {}

  // ── Public — customer browsing ──────────────────────────
  @Get('providers/:providerId/specialists')
  findAllForProvider(@Param('providerId') providerId: string) {
    return this.specialistsService.findAllForProvider(providerId);
  }

  @Get('specialists/:id')
  findOne(@Param('id') id: string) {
    return this.specialistsService.findOne(id);
  }

  // ── Provider-admin manages their own staff ──────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER_ADMIN, UserRole.SUPER_ADMIN)
  @Post('providers/:providerId/specialists')
  create(
    @Param('providerId') providerId: string,
    @Body() dto: CreateSpecialistDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.specialistsService.create(providerId, dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER_ADMIN, UserRole.SUPER_ADMIN)
  @Patch('specialists/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSpecialistDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.specialistsService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER_ADMIN, UserRole.SUPER_ADMIN)
  @Delete('specialists/:id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.specialistsService.remove(id, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER_ADMIN, UserRole.SUPER_ADMIN)
  @Post('specialists/:id/services')
  assignService(
    @Param('id') id: string,
    @Body() dto: AssignServiceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.specialistsService.assignService(id, dto.serviceId, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER_ADMIN, UserRole.SUPER_ADMIN)
  @Delete('specialists/:id/services/:serviceId')
  unassignService(
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.specialistsService.unassignService(id, serviceId, user);
  }
}
