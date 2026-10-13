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
