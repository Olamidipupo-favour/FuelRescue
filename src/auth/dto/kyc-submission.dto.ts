import { IsEnum, IsISO8601, IsOptional, IsString, ValidateIf } from 'class-validator';

export enum DocumentType {
  NIN = 'NIN',
  BVN = 'BVN',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  VOTERS_CARD = 'VOTERS_CARD',
  PASSPORT = 'PASSPORT',
  PROOF_OF_ADDRESS = 'PROOF_OF_ADDRESS',
  PROFILE_PHOTO = 'PROFILE_PHOTO',
}

export class KycSubmissionDto {
  @IsEnum(DocumentType, { message: 'Document type must be one of the valid document types' })
  documentType: DocumentType;

  @IsString({ message: 'Document number must be a string' })
  @ValidateIf(o => o.documentType !== DocumentType.PROFILE_PHOTO && o.documentType !== DocumentType.PROOF_OF_ADDRESS)
  documentNumber?: string;

  @IsString({ message: 'Document image must be a string (base64 or URL)' })
  documentImage: string;

  @IsISO8601({}, { message: 'Expiry date must be a valid date in ISO format (YYYY-MM-DD)' })
  @ValidateIf(o => o.documentType === DocumentType.DRIVERS_LICENSE || o.documentType === DocumentType.PASSPORT)
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  additionalInfo?: string;
} 