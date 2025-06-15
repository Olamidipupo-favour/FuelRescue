import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class LoginClassDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsOptional()
  phone: string

  @IsString()
  @MinLength(6)
  password: string;

}
