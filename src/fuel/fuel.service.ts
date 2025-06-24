import { Queue } from 'bullmq';
import { Utils } from '../lib/utils';
import { Order } from '@prisma/client';
import { FuelType } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { UpdateFuelDto } from './dto/update-fuel.dto';
import { CreateOrderDto } from './dto/create-fuel.dto';
import { priceConfigDto } from './dto/price-config.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FuelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: Utils,
    @InjectQueue('fuel-queue') private fuelQueue: Queue,
  ) {}

  create(createFuelDto: CreateOrderDto) {
    return 'This action adds a new fuel';
  }

  findFuelTypes() {
    return Object.values(FuelType);
  }

  async determinePrice(payload: priceConfigDto) {
    const {
      quantity = 0,
      deliveryMode = 'STANDARD',
      distance = 0,
      fuelType,
    } = payload;
    const priceConfig = await this.prisma.priceConfiguration.findFirst({
      where: {
        fuelType: fuelType,
        deliveryMode: deliveryMode,
      },
    });

    if (!priceConfig) {
      throw new Error('Price configuration not found');
    }
    const {
      basePrice,
      serviceFee,
      distanceFee,
      urgencyFee,
      discountRate,
      discountThreshold,
    } = priceConfig;

    const totalPrice = this.utils.determinePrice({
      basePrice,
      discountRate,
      quantity,
      serviceFee,
      urgencyFee,
      distanceFee,
      distance,
      discountThreshold,
    });
    return totalPrice;
  }

  async findOrders(userId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: true,
      },
    });
    return orders;
  }

  async queueJob(order: Order) {
    const { id, scheduledFor } = order;
    const delay = scheduledFor
      ? scheduledFor.getTime() - Date.now() - 30 * 60 * 1000
      : 0;

    return this.fuelQueue.add(`delivery`, { order }, { delay });
  }

  async test(userId:string){

  }

  async makeOrder(userId: string, createOrderDto: CreateOrderDto) {
    const { items, ...rest } = createOrderDto;
    const { scheduledFor } = rest;
    const order = await this.prisma.order.create({
      data: {
        ...rest,
        userId: userId,
        items: {
          createMany: {
            data: items,
          },
        },
      },
    });
    if (scheduledFor && scheduledFor > new Date()) {
      await this.queueJob(order);
    }
    return order;
  }


  async checkDelivery(id: string) {
    console.log('Checking delivery');
    const order = await this.prisma.order.findUnique({
      where: {
        id: id,
      },
      include: {
        items: true,
      },
    });
    if (!order) return;
    const { scheduledFor } = order;
    if (scheduledFor && scheduledFor < new Date()) {
    }
  }

}
