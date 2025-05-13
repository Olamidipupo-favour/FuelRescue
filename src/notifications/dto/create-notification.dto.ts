import { IsBoolean, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * Data transfer object for creating a notification
 */
export class CreateNotificationDto {
  /**
   * The ID of the user to send the notification to
   */
  @IsString()
  userId: string;

  /**
   * The type of notification (e.g., 'SERVICE_REQUEST', 'PAYMENT', 'SYSTEM')
   */
  @IsString()
  type: string;

  /**
   * The notification title
   */
  @IsString()
  title: string;

  /**
   * The notification message
   */
  @IsString()
  message: string;

  /**
   * URL for the action this notification is about (for deep linking)
   */
  @IsString()
  @IsOptional()
  actionUrl?: string;

  /**
   * Whether to store the notification in the database
   */
  @IsBoolean()
  @IsOptional()
  storeInDatabase?: boolean = true;

  /**
   * Whether to send an email notification
   */
  @IsBoolean()
  @IsOptional()
  sendEmail?: boolean = false;

  /**
   * Whether to send an SMS notification
   */
  @IsBoolean()
  @IsOptional()
  sendSMS?: boolean = false;

  /**
   * Whether to send a push notification
   */
  @IsBoolean()
  @IsOptional()
  sendPush?: boolean = false;

  /**
   * Additional metadata for the notification
   */
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
} 