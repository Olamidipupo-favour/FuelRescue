import { ConfigModule } from '@nestjs/config';
import { FuelModule } from './fuel/fuel.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventModule } from './event/event.module';
import { CreditModule } from './credit/credit.module';
import { PrismaModule } from './prisma/prisma.module';
import { CronModule } from './lib/cronjobs/cron.module';
import { PaymentModule } from './payment/payment.module';
import { QueueModule } from './lib/queuejobs/queue.module';
import { LoggerMiddleware } from './lib/logger.middleware';
import { NotificationModule } from './notifications/notification.module';
import { Module, NestModule , MiddlewareConsumer, RequestMethod} from '@nestjs/common';
import { NigerianVerificationModule } from './helpers/verification/nigerian-verification.module';


@Module({
  imports: [
    // Configure ConfigModule with environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      // Add validation schema if needed
      // validationSchema: Joi.object({
      //   NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
      //   PORT: Joi.number().default(3000),
      //   DATABASE_URL: Joi.string().required(),
      // }),
    }),
    AuthModule,
    FuelModule,
    CronModule,
    QueueModule,
    EventModule,
    PrismaModule,
    PaymentModule,
    NotificationModule,
    ScheduleModule.forRoot(),
    NigerianVerificationModule,
    CreditModule,
  ],
})
export class AppModule  implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({path: '*', method: RequestMethod.ALL});
  }
} 