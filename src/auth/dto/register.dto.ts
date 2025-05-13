import { IsEmail, IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
  })
  password: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Please provide a valid phone number in E.164 format' })
  phone: string;

  @IsEnum(Role, { message: 'Role must be one of: ADMIN, DRIVER, or USER' })
  @IsOptional()
  role?: Role;

  // Optional driver-specific fields
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsISO8601({}, { message: 'License expiry date must be a valid date in ISO format (YYYY-MM-DD)' })
  @IsOptional()
  licenseExpiry?: string;
} 