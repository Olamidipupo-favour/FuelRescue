import axios from 'axios';
import { Utils } from './utils';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class Jobs {
  constructor(
    private readonly prisma: PrismaService,
    private utils: Utils,
  ) {}

  private readonly logger = new Logger(Jobs.name);
  async checkDuePayment() {
    try {
      const response = await this.prisma.payment.findMany({
        where: {
          OR: [
            {
              status: 'FAILED',
            },
            {
              status: 'REFUNDED',
            },
          ],
        },
      });
      for (const payment of response) {
        const { userId } = payment;
        const paymentSummary = await this.utils.generatePaymentSummary(payment);
        const { message } = paymentSummary;
        const payload = {
          userId,
          type: 'PAYMENT',
          title: 'Payment Reminder',
          message: message,
          storeInDatabase: true,
          sendEmail: true,
          sendSMS: true,
          sendPush: true,
        };
        await this.sendReminder(payload); // waits for each reminder to finish
      }
    } catch (error) {
      console.error(`Error accessing payment`);
    }
  }

  async sendReminder(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    storeInDatabase: boolean;
    sendEmail: boolean;
    sendSMS: boolean;
    sendPush: boolean;
  }) {
    await axios.post('http://localhost:3000/notifications', data, {
      withCredentials: true,
    });
  }
}
