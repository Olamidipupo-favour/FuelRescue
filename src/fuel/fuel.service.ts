import { Order } from '@prisma/client';
import { FuelType } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { determinePrice } from './lib/utils';
import { queueJob } from './lib/cronjobs/queqe-fuel-order';
import { CreateOrderDto } from './dto/create-fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';
import { priceConfigDto } from './dto/price-config.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FuelService {
  constructor(private readonly prisma: PrismaService) {}
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

    const totalPrice = determinePrice({
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

  async makeOrder(userId: string, createOrderDto: CreateOrderDto) {
    const { items, ...rest } = createOrderDto;
    const {scheduledFor} = rest
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
    if (scheduledFor && scheduledFor > new Date()){
      await queueJob({jobName:'createDelivery', order})
    }
    return order;
  }

  async test(userId: string) {
    await this.prisma.priceConfiguration.updateMany({
      where: {
        fuelType: 'GASOLINE',
        deliveryMode: 'EMERGENCY',
      },
      data: {
        urgencyFee: 75
      },
    });
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
    if (!order) return
    const {scheduledFor} = order;
    if (scheduledFor && scheduledFor < new Date()) {

    }
  }

  update(id: number, updateFuelDto: UpdateFuelDto) {
    return `This action updates a #${id} fuel`;
  }

  remove(id: number) {
    return `This action removes a #${id} fuel`;
  }
}
