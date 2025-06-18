import { OrderStatus } from '@prisma/client';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  name: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  totalPrice: number;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  serviceId?: string;
}

export class CreateOrderDto {
  @IsString()
  userId: string;

  @IsString()
  orderNumber: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsNumber()
  totalAmount: number;

  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  deliveryLocationId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduledFor?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cancelledAt?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}