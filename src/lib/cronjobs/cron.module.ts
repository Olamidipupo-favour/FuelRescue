import { Module } from '@nestjs/common';
import { Jobs } from '../due-payment';
import { PrismaService } from 'src/prisma/prisma.service';
import { CronService } from './cron.service';
import { Utils } from '../utils';

@Module({
  providers: [Jobs, CronService, Utils, PrismaService],
  exports: [CronService],
})
export class CronModule {}
