import { Role, UserStatus } from '@prisma/client';
import { IsEmail, IsString, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @IsString()
  profilePicture?: string;

  @IsString()
  address?: string;

  @IsString()
  city?: string;

  @IsString()
  state?: string;

  @IsString()
  zip?: string;

  @IsString()
  country?: string;

  @IsEnum(Role)
  role?: Role;

  @IsEnum(UserStatus)
  status?: UserStatus;
}
