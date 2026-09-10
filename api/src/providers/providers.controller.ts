import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private providersService: ProvidersService) {}

  // ── Public — customer browsing, no auth required ────────
  // ?search=, ?category=, ?lat=&lng= are all optional — real filtering
  // and distance sorting now happen in the service, not decoratively
  // on the frontend.
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    return this.providersService.findAll({
      search,
      category,
      lat: lat !== undefined ? Number(lat) : undefined,
      lng: lng !== undefined ? Number(lng) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }

  @Get(':id/availability')
  getAvailability(@Param('id') id: string) {
    return this.providersService.getAvailability(id);
  }

  // ── Super-admin: provision a new provider ───────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateProviderDto) {
    return this.providersService.create(dto);
  }

  // ── Provider-admin (own salon) or super-admin ───────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER_ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProviderDto,
    @CurrentUser() user: { userId: string; role: UserRole },
  ) {
    return this.providersService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER_ADMIN, UserRole.SUPER_ADMIN)
  @Post(':id/gallery')
  addGalleryImage(
    @Param('id') id: string,
    @Body('url') url: string,
    @CurrentUser() user: { userId: string; role: UserRole },
  ) {
    return this.providersService.addGalleryImage(id, url, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER_ADMIN, UserRole.SUPER_ADMIN)
  @Post(':id/availability')
  setAvailability(
    @Param('id') id: string,
    @Body() dto: SetAvailabilityDto,
    @CurrentUser() user: { userId: string; role: UserRole },
  ) {
    return this.providersService.setAvailability(id, dto, user);
  }

  // ── Super-admin oversight ───────────────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/enable')
  enable(@Param('id') id: string) {
    return this.providersService.setEnabled(id, true);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/disable')
  disable(@Param('id') id: string) {
    return this.providersService.setEnabled(id, false);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/verify')
  verify(@Param('id') id: string) {
    return this.providersService.setVerified(id, true);
  }
}
