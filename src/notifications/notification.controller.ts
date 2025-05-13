import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Controller for notification endpoints
 */
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Send a notification to a user
   * @param createNotificationDto The notification data
   * @returns The notification result
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  sendNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.sendNotification(createNotificationDto);
  }

  /**
   * Get all notifications for a user
   * @param userId The user ID
   * @param limit Maximum number of notifications to return
   * @param offset Pagination offset
   * @returns Array of notifications
   */
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  getUserNotifications(
    @Param('userId') userId: string,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    return this.notificationService.getUserNotifications(userId, +limit, +offset);
  }

  /**
   * Mark a notification as read
   * @param id The notification ID
   * @returns The updated notification
   */
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  /**
   * Mark all notifications for a user as read
   * @param userId The user ID
   * @returns The number of updated notifications
   */
  @Patch('user/:userId/read-all')
  @UseGuards(JwtAuthGuard)
  markAllAsRead(@Param('userId') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }
} 