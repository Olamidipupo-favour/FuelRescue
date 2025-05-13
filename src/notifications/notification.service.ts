import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DatabaseNotificationProvider } from './providers/database-notification.provider';
import { EmailNotificationProvider } from './providers/email-notification.provider';
import { SmsNotificationProvider } from './providers/sms-notification.provider';
import { PushNotificationProvider } from './providers/push-notification.provider';
import { NotificationOptions } from './interfaces/notification-channel.interface';
import { CreateNotificationDto } from './dto/create-notification.dto';

/**
 * Service for sending notifications through various channels
 */
@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private databaseNotificationProvider: DatabaseNotificationProvider,
    private emailNotificationProvider: EmailNotificationProvider,
    private smsNotificationProvider: SmsNotificationProvider,
    private pushNotificationProvider: PushNotificationProvider,
  ) {}

  /**
   * Send a notification to a user through the specified channels
   * @param createNotificationDto The notification data
   * @returns A promise that resolves with the notification results
   */
  async sendNotification(createNotificationDto: CreateNotificationDto): Promise<any> {
    const {
      userId,
      type,
      title,
      message,
      actionUrl,
      storeInDatabase = true,
      sendEmail = false,
      sendSMS = false,
      sendPush = false,
      metadata = {},
    } = createNotificationDto;

    try {
      // Get user from database
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const options = {
        type,
        actionUrl,
        metadata,
      };

      // Results object to track success/failure of each channel
      const results: Record<string, boolean> = {};

      // Send through each requested channel
      if (storeInDatabase) {
        results.database = await this.databaseNotificationProvider.send(user, title, message, options);
      }

      if (sendEmail) {
        results.email = await this.emailNotificationProvider.send(user, title, message, options);
      }

      if (sendSMS) {
        results.sms = await this.smsNotificationProvider.send(user, title, message, options);
      }

      if (sendPush) {
        results.push = await this.pushNotificationProvider.send(user, title, message, options);
      }

      return {
        success: Object.values(results).some(result => result === true),
        results,
      };
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Send a notification to multiple users
   * @param userIds Array of user IDs to notify
   * @param type Notification type
   * @param title Notification title
   * @param message Notification message
   * @param options Notification options
   * @returns Results for each user
   */
  async sendBulkNotification(
    userIds: string[],
    type: string,
    title: string,
    message: string,
    options: NotificationOptions = {},
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    for (const userId of userIds) {
      try {
        const result = await this.sendNotification({
          userId,
          type,
          title,
          message,
          storeInDatabase: options.storeInDatabase,
          sendEmail: options.sendEmail,
          sendSMS: options.sendSMS,
          sendPush: options.sendPush,
          actionUrl: options.metadata?.actionUrl,
          metadata: options.metadata,
        });
        
        results[userId] = result;
      } catch (error) {
        results[userId] = { success: false, error: error.message };
      }
    }

    return results;
  }

  /**
   * Get all notifications for a user
   * @param userId The user ID
   * @param limit Maximum number of notifications to return
   * @param offset Pagination offset
   * @returns Array of notifications
   */
  async getUserNotifications(userId: string, limit = 10, offset = 0): Promise<any[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Mark a notification as read
   * @param notificationId The notification ID
   * @returns The updated notification
   */
  async markAsRead(notificationId: string): Promise<any> {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications for a user as read
   * @param userId The user ID
   * @returns The number of updated notifications
   */
  async markAllAsRead(userId: string): Promise<any> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    
    return { count: result.count };
  }
} 