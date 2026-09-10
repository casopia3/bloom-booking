import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard) // every route here requires being logged in as *someone* —
// which specific user's notifications you see is enforced inside the service,
// not by role, since every role receives notifications.
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findMine(@CurrentUser() user: { userId: string; role: UserRole }) {
    return this.notificationsService.findForUser(user.userId);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: { userId: string; role: UserRole }) {
    return this.notificationsService.markRead(id, user.userId);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: { userId: string; role: UserRole }) {
    return this.notificationsService.markAllRead(user.userId);
  }
}
