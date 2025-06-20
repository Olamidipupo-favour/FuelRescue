import { FuelType , DeliveryMode} from "@prisma/client";
import { IsString, IsNumber, IsEnum } from "class-validator";

export class priceConfigDto {
  @IsString()
  quantity: number;
  
  @IsEnum(DeliveryMode)
  deliveryMode: 'STANDARD' | 'SCHEDULED' | 'EMERGENCY';

  @IsNumber()
  distance: number;
  
  @IsNumber()
  discount: number;

  @IsEnum(FuelType)
  fuelType: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'OTHER'
}
