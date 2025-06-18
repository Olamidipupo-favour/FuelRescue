import { Request } from 'express';
import { FuelService } from './fuel.service';
import { CreateOrderDto } from './dto/create-fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete , Req} from '@nestjs/common';


@Controller('fuel')
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Post()
  create(@Body() createFuelDto: CreateOrderDto) {
    return this.fuelService.create(createFuelDto);
  }
  @Get('fueltypes')
  findAll() {
    return this.fuelService.findFuelTypes();
  }

  @Post('getOrders') 
  findOrders(@Req() request: Request) {
    const payload =  request.cookies['sessionId']
    const {userId} = payload
    return this.fuelService.findOrders(userId);
  }

  @Post('orders') 
  makeOrder(@Req() request: Request, @Body() createOrderDto: CreateOrderDto) {
    const payload =  request.cookies['sessionId']
    const {userId} = payload
    return this.fuelService.makeOrder(userId, createOrderDto);
  }

  @Post('testdata')
  pushTest(@Req() request: Request) {
    const payload =  request.cookies['sessionId']
    const {userId} = payload
    return this.fuelService.test(userId);
  }

  @Get('orders/:orderId')
  findOne(@Param('orderId') orderId: string) {
    return this.fuelService.checkDelivery(orderId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFuelDto: UpdateFuelDto) {
    return this.fuelService.update(+id, updateFuelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fuelService.remove(+id);
  }
}
