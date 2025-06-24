import { Module } from '@nestjs/common';
import { FuelService } from './fuel.service';
import { FuelController } from './fuel.controller';
import { EventModule } from 'src/event/event.module';
import { BullModule } from '@nestjs/bullmq';
import { Utils } from '../lib/utils';
import { Dispatch } from '../lib/dispatch';

@Module({
  imports: [
    EventModule,
    BullModule.forRoot({
      connection: {
        // host: process.env.REDIS_HOST,
        // port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
        // password: process.env.REDIS_PASSWORD
        host: 'localhost',
        port: 6379,
      },
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
    BullModule.registerQueue({
      name: 'fuel-queue',
    }),
  ],
  controllers: [FuelController],
  providers: [FuelService, Utils, Dispatch],
})
export class FuelModule {}
