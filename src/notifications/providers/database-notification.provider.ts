import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationChannel } from '../interfaces/notification-channel.interface';
import { User } from '@prisma/client';

/**
 * Provider for storing notifications in the database
 */
@Injectable()
export class DatabaseNotificationProvider implements NotificationChannel {
  constructor(private prisma: PrismaService) {}

  /**
   * Store a notification in the database
   */
  async send(user: User, title: string, message: string, options?: Record<string, any>): Promise<boolean> {
    try {
      const type = options?.type || 'SYSTEM';
      const actionUrl = options?.actionUrl;
      const metadata = options?.metadata || {};

      await this.prisma.notification.create({
        data: {
          title,
          message,
          type,
          actionUrl,
          metadata,
          user: {
            connect: { id: user.id }
          }
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to store notification in database:', error);
      return false;
    }
  }
} 