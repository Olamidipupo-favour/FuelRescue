import { IsString } from 'class-validator';

export class VerifyTokenDto {
  @IsString()
  userId: string;
  
  @IsString()
  token: string;
}
