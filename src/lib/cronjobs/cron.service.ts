import { Jobs } from '../due-payment';
import { Cron } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CronService {
  constructor(private jobs: Jobs) {}

  @Cron('0 */5 22-23 * * *')
  async handleCron() {
    try {
      await this.jobs.checkDuePayment();
    } catch (error) {
      console.error(`Error in cron job: ${error}`);
    }
  }
}
