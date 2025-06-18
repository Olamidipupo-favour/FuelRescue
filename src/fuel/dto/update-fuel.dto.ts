import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-fuel.dto';

export class UpdateFuelDto extends PartialType(CreateOrderDto) {}
