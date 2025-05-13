import { User } from '@prisma/client';

/**
 * Options for sending notifications through various channels
 */
export interface NotificationOptions {
  /**
   * Whether to store the notification in the database
   */
  storeInDatabase?: boolean;
  
  /**
   * Whether to send an email notification
   */
  sendEmail?: boolean;
  
  /**
   * Whether to send an SMS notification
   */
  sendSMS?: boolean;
  
  /**
   * Whether to send a push notification
   */
  sendPush?: boolean;
  
  /**
   * Additional metadata to include with the notification
   */
  metadata?: Record<string, any>;
}

/**
 * Base interface for notification channels
 */
export interface NotificationChannel {
  /**
   * Send a notification through this channel
   * @param user The user to send the notification to
   * @param title The notification title
   * @param message The notification message
   * @param options Additional options for this notification channel
   * @returns A promise that resolves when the notification is sent
   */
  send(user: User, title: string, message: string, options?: Record<string, any>): Promise<boolean>;
} 