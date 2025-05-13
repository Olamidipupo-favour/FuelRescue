import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { DatabaseNotificationProvider } from './providers/database-notification.provider';
import { EmailNotificationProvider } from './providers/email-notification.provider';
import { SmsNotificationProvider } from './providers/sms-notification.provider';
import { PushNotificationProvider } from './providers/push-notification.provider';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    DatabaseNotificationProvider,
    EmailNotificationProvider,
    SmsNotificationProvider,
    PushNotificationProvider,
  ],
  exports: [NotificationService],
})
export class NotificationModule {} 