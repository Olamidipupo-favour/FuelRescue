import { Controller, Get, Post, Body, Patch, Param, Delete,  Req } from '@nestjs/common';
import { CreditService } from './credit.service';

import {  Request } from 'express';

@Controller('credit')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Post('get_credit_score')
  async getCreditScore(@Req() request: Request){
    const userId =  request.cookies['sessionId']
    return await this.creditService.getCreditScore(userId)
  }

}
