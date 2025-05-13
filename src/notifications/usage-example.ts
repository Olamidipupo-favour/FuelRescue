/**
 * This file provides examples of how to use the NotificationService in your application.
 * It is not meant to be imported - these are code snippets to copy into your services.
 */

/**
 * Example 1: Basic usage in a service 
 */
import { Injectable } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Injectable()
export class ExampleService {
  constructor(private notificationService: NotificationService) {}

  /**
   * Example: Send a notification when a service request is accepted
   */
  async handleServiceRequestAccepted(serviceRequestId: string, userId: string, driverId: string) {
    // 1. Basic notification to user
    await this.notificationService.sendNotification({
      userId,
      type: 'SERVICE_REQUEST',
      title: 'Service Request Accepted',
      message: 'A driver has accepted your fuel delivery request.',
      // Store in database and send email by default
      storeInDatabase: true,
      sendEmail: true,
      actionUrl: `/service-requests/${serviceRequestId}`,
      metadata: {
        serviceRequestId,
        driverId
      }
    });

    // 2. Alternative: Using direct method with sms
    await this.notificationService.sendNotification({
      userId: driverId,
      type: 'SERVICE_REQUEST',
      title: 'New Service Assignment',
      message: 'You have been assigned a new fuel delivery service.',
      storeInDatabase: true,
      sendSMS: true,
      actionUrl: `/driver/service-requests/${serviceRequestId}`,
    });
  }

  /**
   * Example: Send bulk notifications to multiple users
   */
  async notifyNearbyDrivers(serviceRequestId: string, nearbyDriverIds: string[]) {
    await this.notificationService.sendBulkNotification(
      nearbyDriverIds,
      'SERVICE_REQUEST',
      'New Service Request Nearby',
      'There is a new fuel delivery request in your area.',
      {
        storeInDatabase: true,
        sendPush: true,
        metadata: {
          serviceRequestId,
          actionUrl: `/driver/service-requests/${serviceRequestId}`
        }
      }
    );
  }
}

/**
 * Example 2: Using in a controller method
 */
@Injectable()
export class ExampleControllerService {
  constructor(private notificationService: NotificationService) {}
  
  async completeServiceRequest(serviceRequestId: string, userId: string) {
    // Service logic to complete the request
    // ...
    
    // Send a multi-channel notification
    await this.notificationService.sendNotification({
      userId,
      type: 'SERVICE_COMPLETE',
      title: 'Service Completed',
      message: 'Your fuel delivery service has been completed successfully.',
      storeInDatabase: true,
      sendEmail: true,
      sendPush: true, 
      actionUrl: `/service-requests/${serviceRequestId}/review`,
      metadata: {
        serviceRequestId,
        completedAt: new Date().toISOString()
      }
    });
    
    // Return response to client
    return { success: true };
  }
}

/**
 * Example 3: Advanced usage with conditional channels
 */
@Injectable()
export class PaymentNotificationService {
  constructor(private notificationService: NotificationService) {}
  
  async sendPaymentNotification(
    userId: string, 
    paymentId: string,
    paymentStatus: string,
    amount: number
  ) {
    // Determine which channels to use based on payment status
    const isSuccessful = paymentStatus === 'COMPLETED';
    const isFailed = paymentStatus === 'FAILED';
    
    // Prepare the notification content
    const title = isSuccessful 
      ? 'Payment Successful' 
      : isFailed 
        ? 'Payment Failed' 
        : 'Payment Update';
    
    const message = isSuccessful
      ? `Your payment of $${amount.toFixed(2)} has been processed successfully.`
      : isFailed
        ? `Your payment of $${amount.toFixed(2)} failed to process. Please update your payment information.`
        : `Your payment of $${amount.toFixed(2)} status has been updated to ${paymentStatus}.`;
    
    // Always store important payment notifications, but only email for failures
    await this.notificationService.sendNotification({
      userId,
      type: 'PAYMENT',
      title,
      message,
      storeInDatabase: true,
      sendEmail: isFailed, // Only send email for failed payments
      sendPush: true,      // Always send push
      actionUrl: isFailed ? '/payments/update' : `/payments/${paymentId}`,
      metadata: {
        paymentId,
        status: paymentStatus,
        amount
      }
    });
  }
} 