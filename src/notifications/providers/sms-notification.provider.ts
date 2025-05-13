import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel } from '../interfaces/notification-channel.interface';
import { User } from '@prisma/client';

/**
 * Provider for sending SMS notifications
 */
@Injectable()
export class SmsNotificationProvider implements NotificationChannel {
  constructor(private configService: ConfigService) {}

  /**
   * Send an SMS notification
   */
  async send(user: User, title: string, message: string, options?: Record<string, any>): Promise<boolean> {
    try {
      // This is a placeholder for actual SMS sending logic
      // In a real implementation, you would use a service like:
      // - Twilio
      // - Vonage (Nexmo)
      // - AWS SNS
      // - MessageBird
      // etc.
      
      if (!user.phone) {
        console.warn('Cannot send SMS: User has no phone number');
        return false;
      }
      
      console.log(`[SMS NOTIFICATION] To: ${user.phone}, Message: ${title}: ${message}`);
      
      // Here you would implement the actual SMS sending
      // Example with a hypothetical SMS service:
      /*
      const smsService = new SmsService(
        this.configService.get('SMS_ACCOUNT_SID'),
        this.configService.get('SMS_AUTH_TOKEN')
      );
      
      await smsService.sendMessage({
        to: user.phone,
        body: `${title}: ${message}`,
      });
      */
      
      return true;
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
      return false;
    }
  }
} 