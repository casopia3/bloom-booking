import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { Customer } from '@prisma/client';
@Controller('providers')
export class ProvidersController {
  constructor(private providersService: ProvidersService) {}

  // ── Provider-admin self-lookup ──────────────────────────
  // MUST be registered before @Get(':id') — otherwise Nest would try to
  // treat "me" as an :id value and this route would never be reached.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER_ADMIN)
  @Get('me')
  findMine(@CurrentUser() user: { userId: string; role: UserRole }) {
    return this.providersService.findMine(user);
  }

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
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@Get('favourites')
findMyFavourites(
  @CurrentUser() user: { userId: string; role: UserRole },
) {
  return this.providersService.findMyFavourites(user.userId);
}
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@Post(':id/favourite')
addFavourite(
  @Param('id') id: string,
  @CurrentUser() user: { userId: string; role: UserRole },
) {
  return this.providersService.addFavourite(id, user.userId);
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@Delete(':id/favourite')
removeFavourite(
  @Param('id') id: string,
  @CurrentUser() user: { userId: string; role: UserRole },
) {
  return this.providersService.removeFavourite(id, user.userId);
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@Get(':id/favourite')
isFavourite(
  @Param('id') id: string,
  @CurrentUser() user: { userId: string; role: UserRole },
) {
  return this.providersService.isFavourite(id, user.userId);
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
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/providers',
      filename: (_req, file, cb) => {
        const extension = extname(file.originalname).toLowerCase();
        cb(null, `${randomUUID()}${extension}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error('Only JPG, PNG, WEBP, and GIF images are allowed.'),
          false,
        );
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  }),
)
addGalleryImage(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
  @CurrentUser() user: { userId: string; role: UserRole },
) {
  if (!file) {
    throw new Error('Image file is required.');
  }

  const imageUrl = `/uploads/providers/${file.filename}`;

  return this.providersService.addGalleryImage(
    id,
    imageUrl,
    user,
  );
}
      
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER_ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':id/gallery/:imageId')
  deleteGalleryImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: { userId: string; role: UserRole },
  ) {
    return this.providersService.deleteGalleryImage(id, imageId, user);
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER_ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id/availability/:availabilityId')
  updateAvailability(
    @Param('id') id: string,
    @Param('availabilityId') availabilityId: string,
    @Body() dto: UpdateAvailabilityDto,
    @CurrentUser() user: { userId: string; role: UserRole },
  ) {
    return this.providersService.updateAvailability(id, availabilityId, dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER_ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':id/availability/:availabilityId')
  deleteAvailability(
    @Param('id') id: string,
    @Param('availabilityId') availabilityId: string,
    @CurrentUser() user: { userId: string; role: UserRole },
  ) {
    return this.providersService.deleteAvailability(id, availabilityId, user);
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