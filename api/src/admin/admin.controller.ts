import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { v2 as cloudinary } from 'cloudinary';

import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN) // every route in this controller is admin-only —
// applied once at class level since there's no mixed public/protected
// split here, unlike providers/bookings/reviews controllers.
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard/summary')
  getDashboardSummary() {
    return this.adminService.getDashboardSummary();
  }

  @Get('providers')
  findAllProviders() {
    return this.adminService.findAllProviders();
  }

  @Get('providers/pending')
  findPendingProviders() {
    return this.adminService.findPendingProviders();
  }

  @Get('customers')
  findAllCustomers() {
    return this.adminService.findAllCustomers();
  }

  @Get('specialists')
  findAllSpecialists() {
    return this.adminService.findAllSpecialists();
  }

  @Get('payments')
  findAllPayments() {
    return this.adminService.findAllPayments();
  }

  @Patch('users/:id/enable')
  enableUser(@Param('id') id: string) {
    return this.adminService.setUserActive(id, true);
  }

  @Patch('users/:id/disable')
  disableUser(@Param('id') id: string) {
    return this.adminService.setUserActive(id, false);
  }
     @Post('promotions/upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
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
            new BadRequestException(
              'Only JPG, PNG, WEBP, and GIF images are allowed.',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadPromotionImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'A valid promotion image file is required.',
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException(
        'Cloud image storage is not configured.',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'bloom-booking/promotions',
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary upload failed.'));
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        },
      );

      stream.end(file.buffer);
    });

    return {
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  }
    @Get('promotions')
  findAllPromotions() {
    return this.adminService.findAllPromotions();
  }

  @Post('promotions')
  createPromotion(@Body() body: {
    title: string;
    description?: string;
    discount?: string;
    buttonText?: string;
    category?: string;
    imageUrl?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    sortOrder?: number;
  }) {
    return this.adminService.createPromotion(body);
  }

  @Patch('promotions/:id')
  updatePromotion(
    @Param('id') id: string,
    @Body() body: {
      title?: string;
      description?: string;
      discount?: string;
      buttonText?: string;
      category?: string;
      imageUrl?: string;
      startDate?: string;
      endDate?: string;
      isActive?: boolean;
      sortOrder?: number;
    },
  ) {
    return this.adminService.updatePromotion(id, body);
  }

  @Delete('promotions/:id')
  deletePromotion(@Param('id') id: string) {
    return this.adminService.deletePromotion(id);
  }
  @Patch('providers/:id/enable')
enableProvider(@Param('id') id: string) {
  return this.adminService.setProviderEnabled(id, true);
}

@Patch('providers/:id/disable')
disableProvider(@Param('id') id: string) {
  return this.adminService.setProviderEnabled(id, false);
}
@Get('services')
findAllServices() {
  return this.adminService.findAllServices();
}
}
