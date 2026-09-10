import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService], // BookingsModule needs this to fire
  // notifications on booking events (created/confirmed/assigned/cancelled/completed)
})
export class NotificationsModule {}
