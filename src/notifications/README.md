# FuelRescue Notification System

The notification system provides a flexible way to send notifications to users through multiple channels.

## Features

- Send notifications through multiple channels:
  - Database storage (for in-app notifications)
  - Email
  - SMS
  - Push notifications
- Selective channel delivery (choose which channels to use for each notification)
- Bulk notifications to multiple users
- Rich metadata support for all notification types
- Mark notifications as read individually or in bulk

## Usage

### Basic Usage

```typescript
// Inject the notification service
constructor(private notificationService: NotificationService) {}

// Send a notification
await this.notificationService.sendNotification({
  userId: 'user-id',
  type: 'SERVICE_REQUEST',
  title: 'Service Request Accepted',
  message: 'A driver has accepted your fuel delivery request.',
  storeInDatabase: true,
  sendEmail: true,
  sendSMS: false,
  sendPush: true,
  actionUrl: '/service-requests/123',
  metadata: {
    serviceRequestId: '123',
    driverId: 'driver-id'
  }
});
```

### Bulk Notifications

```typescript
// Send to multiple users
await this.notificationService.sendBulkNotification(
  ['user-id-1', 'user-id-2', 'user-id-3'],
  'SYSTEM',
  'System Maintenance',
  'The system will be down for maintenance on Saturday.',
  {
    storeInDatabase: true,
    sendEmail: true
  }
);
```

### Retrieving Notifications

```typescript
// Get user notifications
const notifications = await this.notificationService.getUserNotifications(userId, 10, 0);
```

### Marking Notifications as Read

```typescript
// Mark a single notification as read
await this.notificationService.markAsRead(notificationId);

// Mark all notifications as read
await this.notificationService.markAllAsRead(userId);
```

## Extending the System

### Adding a New Channel

1. Create a new provider implementing the `NotificationChannel` interface
2. Register it in the `NotificationModule`
3. Update the `NotificationService` to use the new channel

Example:

```typescript
@Injectable()
export class NewChannelProvider implements NotificationChannel {
  async send(user: User, title: string, message: string, options?: Record<string, any>): Promise<boolean> {
    // Implementation
    return true;
  }
}
```

## Architecture

The notification system uses a provider-based architecture:

- `NotificationService`: Orchestrates all notification channels
- Channel Providers: Implement the `NotificationChannel` interface
  - `DatabaseNotificationProvider`: Stores notifications in the database
  - `EmailNotificationProvider`: Sends email notifications
  - `SmsNotificationProvider`: Sends SMS notifications
  - `PushNotificationProvider`: Sends push notifications

## Configuration

The notification system uses environment variables for configuration:

- `EMAIL_*`: Email service configuration
- `SMS_*`: SMS service configuration
- `PUSH_*`: Push notification service configuration

See the individual providers for specific configuration options. 