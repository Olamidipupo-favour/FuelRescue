import { timeout } from 'rxjs';
import { OnModuleInit } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, TcpStatus } from '@nestjs/microservices';

@Injectable()
export class CreditService implements OnModuleInit {
  constructor(@Inject('RISK_SERVICE') private readonly client: ClientProxy) {}

  onModuleInit() {
    this.client.status.subscribe((status: TcpStatus) => {
      console.log('Microservice connection status:', status);
    });
  }

  async getCreditScore(userId: string) {
    const pattern = { cmd: 'risk' };
    try {
      const response = this.client.send(pattern, userId).pipe(timeout(5000));
      return response;
    } catch (error) {
      console.error(`Error getting credit score: ${error}`);
    }
  }
}
