import { Module } from '@nestjs/common';
import { Utils } from '../utils';
import { Dispatch } from '../dispatch';
import { FuelOrderProcessor } from './fuel-queue.service';

@Module({
  imports: [],
  providers: [FuelOrderProcessor, Utils, Dispatch],
  exports: [FuelOrderProcessor],
})
export class QueueModule {}
