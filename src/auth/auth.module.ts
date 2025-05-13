import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesGuard } from './guards/roles.guard';
import { NigerianVerificationService } from './services/nigerian-verification.service';
import { NigerianVerificationHelper } from '../helpers/verification/nigerian-verification.helper';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    PrismaModule,
    NotificationModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-jwt-secret-key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    NigerianVerificationService,
    NigerianVerificationHelper,
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
  exports: [
    AuthService, 
    JwtStrategy, 
    JwtModule, 
    NigerianVerificationService, 
    NigerianVerificationHelper
  ],
})
export class AuthModule {} 