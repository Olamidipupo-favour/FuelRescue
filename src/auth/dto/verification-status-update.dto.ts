import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ADDITIONAL_INFO_REQUIRED = 'ADDITIONAL_INFO_REQUIRED',
}

export class VerificationStatusUpdateDto {
  @IsEnum(VerificationStatus, { message: 'Status must be a valid verification status' })
  status: VerificationStatus;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  message?: string;
} 