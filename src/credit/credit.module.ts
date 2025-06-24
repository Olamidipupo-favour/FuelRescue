import { Module } from '@nestjs/common';
import { CreditService } from './credit.service';
import { CreditController } from './credit.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      { name: 'RISK_SERVICE', transport: Transport.TCP,  },
    ]),
  ],
  controllers: [CreditController],
  providers: [CreditService],
})
export class CreditModule {}
