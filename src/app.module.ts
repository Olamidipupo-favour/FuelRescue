import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FuelModule } from './fuel/fuel.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationModule } from './notifications/notification.module';
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
    PrismaModule,
    NotificationModule,
    NigerianVerificationModule,
    AuthModule,
    UserModule,
    FuelModule,
  ],
})
export class AppModule {} 