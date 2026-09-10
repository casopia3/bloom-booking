import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generic creation method — called from other modules (bookings, and
   * later payments) at real lifecycle events. Never called directly by a
   * controller; there's no public "create a notification for someone
   * else" endpoint, since that would let any user spam any other user.
   */
  async notify(params: {
    userId: string;
    type: NotificationType;
    title: string;
    body?: string;
    relatedBookingId?: string;
  }) {
    return this.prisma.notification.create({ data: params });
  }

  async findForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId) {
      throw new ForbiddenException('This is not your notification');
    }
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
