import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { AvailabilityService } from './availability.service';
import { BookingLockService } from './booking-lock.service';

@Module({
  imports: [NotificationsModule],
  controllers: [BookingsController],
  providers: [BookingsService, AvailabilityService, BookingLockService],
  exports: [AvailabilityService], // may be reused by reviews module (completed-booking checks)
})
export class BookingsModule {}
