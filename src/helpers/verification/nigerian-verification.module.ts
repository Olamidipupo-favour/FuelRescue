import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NigerianVerificationHelper } from './nigerian-verification.helper';

@Module({
  imports: [ConfigModule],
  providers: [NigerianVerificationHelper],
  exports: [NigerianVerificationHelper],
})
export class NigerianVerificationModule {} 