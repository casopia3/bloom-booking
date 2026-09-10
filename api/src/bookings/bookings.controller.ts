import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BookingsService } from './bookings.service';
import { AvailabilityService } from './availability.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  CancelBookingDto,
  RescheduleBookingDto,
  AssignSpecialistDto,
  UpdateBookingStatusDto,
} from './dto/booking-actions.dto';

@Controller()
export class BookingsController {
  constructor(
    private bookingsService: BookingsService,
    private availabilityService: AvailabilityService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post('bookings')
  create(@Body() dto: CreateBookingDto, @CurrentUser() user: { userId: string; role: UserRole }) {
    return this.bookingsService.create(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookings/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: { userId: string; role: UserRole }) {
    return this.bookingsService.findOne(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookings')
  findMany(
    @Query('customerId') customerId: string,
    @Query('serviceProviderId') serviceProviderId: string,
    @Query('specialistId') specialistId: string,
    @CurrentUser() user: { userId: string; role: UserRole },
  ) {
    return this.bookingsService.findMany({ customerId, serviceProviderId, specialistId }, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('bookings/:id/cancel')
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
    @CurrentUser() user: { userId: string; role: UserRole },
  ) {
    return this.bookingsService.cancel(id, dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('bookings/:id/reschedule')
  reschedule(
    @Param('id') id: string,
    @Body() dto: RescheduleBookingDto,
    @CurrentUser() user: { userId: string; role: UserRole },
  ) {
    return this.bookingsService.reschedule(id, dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER_ADMIN, UserRole.SUPER_ADMIN)
  @Patch('bookings/:id/assign-specialist')
  assignSpecialist(
    @Param('id') id: string,
    @Body() dto: AssignSpecialistDto,
    @CurrentUser() user: { userId: string; role: UserRole },
  ) {
    return this.bookingsService.assignSpecialist(id, dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('bookings/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
    @CurrentUser() user: { userId: string; role: UserRole },
  ) {
    return this.bookingsService.updateStatus(id, dto, user);
  }

  // Public — no guard. Customers need this before/during booking creation,
  // including before they've necessarily authenticated in the flow.
  @Get('availability')
  getAvailability(
    @Query('providerId') providerId: string,
    @Query('specialistId') specialistId: string,
    @Query('date') date: string,
    @Query('durationMin') durationMin: string,
  ) {
    return this.availabilityService.getAvailableSlots({
      serviceProviderId: providerId,
      specialistId: specialistId || null,
      date: new Date(date),
      durationMin: Number(durationMin),
    });
  }
}
