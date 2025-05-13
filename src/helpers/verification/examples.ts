// This file provides examples of how to use the Nigerian verification helper
// It is not meant to be imported - these are code snippets to copy into your services or controllers

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NigerianVerificationHelper } from './nigerian-verification.helper';
import { NotificationService } from '../../notifications/notification.service';

/**
 * Example service that integrates the Nigerian verification helper with notifications
 */
@Injectable()
export class UserVerificationService {
  constructor(
    private nigerianVerification: NigerianVerificationHelper,
    private notificationService: NotificationService
  ) {}

  /**
   * Example: Verify a user's NIN and send notification
   */
  async verifyUserNin(userId: string, nin: string) {
    try {
      // Use the helper for NIN verification
      const result = await this.nigerianVerification.primaryVerification('nin', nin);
      
      // Integration with your notification system
      if (result.success) {
        await this.notificationService.sendNotification({
          userId,
          type: 'VERIFICATION',
          title: 'NIN Verification Successful',
          message: 'Your NIN has been successfully verified.',
          storeInDatabase: true,
          sendEmail: true,
          sendPush: true,
        });
        
        // Here you would also update your user's verification status in the database
        // await this.prisma.user.update({ where: { id: userId }, data: { verified: true } });
        
        return {
          success: true,
          message: 'NIN verification successful',
        };
      }
      
      return {
        success: false,
        message: 'NIN verification failed',
      };
    } catch (error) {
      // Send notification about the failure
      await this.notificationService.sendNotification({
        userId,
        type: 'VERIFICATION',
        title: 'NIN Verification Failed',
        message: `Your NIN verification failed: ${error.message || 'Unknown error'}`,
        storeInDatabase: true,
        sendEmail: true,
      });
      
      throw error;
    }
  }

  /**
   * Example: Verify a driver's license and send notification
   */
  async verifyDriversLicense(userId: string, licenseNumber: string) {
    try {
      // Use the helper for Driver's License verification
      const result = await this.nigerianVerification.secondaryVerification("driver's license", licenseNumber);
      
      // Integration with your notification system
      if (result.success) {
        await this.notificationService.sendNotification({
          userId,
          type: 'VERIFICATION',
          title: "Driver's License Verification Successful",
          message: "Your driver's license has been successfully verified.",
          storeInDatabase: true,
          sendEmail: true,
          sendPush: true,
        });
        
        return {
          success: true,
          message: "Driver's license verification successful",
        };
      }
      
      return {
        success: false,
        message: "Driver's license verification failed",
      };
    } catch (error) {
      // Send notification about the failure
      await this.notificationService.sendNotification({
        userId,
        type: 'VERIFICATION',
        title: "Driver's License Verification Failed",
        message: `Your driver's license verification failed: ${error.message || 'Unknown error'}`,
        storeInDatabase: true,
        sendEmail: true,
      });
      
      throw error;
    }
  }
}

/**
 * Example: Using helper in controller with dependency injection
 */
@Injectable()
class ExampleController {
  constructor(
    private nigerianVerification: NigerianVerificationHelper,
    private configService: ConfigService
  ) {}
  
  // @Post('verify-nin')
  // @UseGuards(JwtAuthGuard)
  async verifyNin(userId: string, nin: string) {
    try {
      // NigerianVerificationHelper is injected via constructor
      const result = await this.nigerianVerification.primaryVerification('nin', nin);
      
      // Process the result
      if (result.success) {
        // Update user in database, send notifications, etc.
        return {
          success: true,
          message: 'NIN verification successful',
        };
      }
      
      return {
        success: false,
        message: 'NIN verification failed',
      };
    } catch (error) {
      // Handle errors
      throw error;
    }
  }
} 