import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Role, User } from '@prisma/client';
import { KycSubmissionDto, DocumentType } from './dto/kyc-submission.dto';
import { VerificationStatusUpdateDto, VerificationStatus } from './dto/verification-status-update.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Validate user credentials for login
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Remove password from return object
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * Login a user with email and password
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(`Your account is ${user.status.toLowerCase()}. Please contact support.`);
    }

    return this.generateAuthResponse(user);
  }

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(registerDto.password);

    // Create new user
    const newUser = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        role: registerDto.role || Role.USER,
        status: 'ACTIVE',
      },
    });

    // If user is a driver, create driver record
    if (registerDto.role === Role.DRIVER && registerDto.licenseNumber && registerDto.licenseExpiry) {
      await this.prisma.driver.create({
        data: {
          userId: newUser.id,
          licenseNumber: registerDto.licenseNumber,
          licenseExpiry: new Date(registerDto.licenseExpiry),
          verificationStatus: 'PENDING',
        },
      });
    }

    // Remove password from return object
    const { password: _, ...result } = newUser;
    
    return this.generateAuthResponse(result);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return { success: true, message: 'If your email is registered, you will receive a password reset link.' };
    }

    // Generate a reset token valid for 1 hour
    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'password_reset' },
      { expiresIn: '1h' },
    );

    // In a real app, you would send an email with the reset link
    // For now, just return the token
    return { success: true, message: 'Password reset email sent', resetToken };
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetDto: ResetPasswordDto) {
    try {
      // Verify the reset token
      const payload = this.jwtService.verify(resetDto.token);
      
      if (payload.type !== 'password_reset') {
        throw new BadRequestException('Invalid token type');
      }

      // Hash the new password
      const hashedPassword = await this.hashPassword(resetDto.newPassword);

      // Update the user's password
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { password: hashedPassword },
      });

      return { success: true, message: 'Password has been reset successfully' };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new BadRequestException('Invalid or expired token');
      }
      throw error;
    }
  }

  /**
   * Change password (requires current password)
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash the new password
    const hashedPassword = await this.hashPassword(changePasswordDto.newPassword);

    // Update the password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true, message: 'Password changed successfully' };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        driver: true,
        vehicles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove password from return object
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Check if email already exists (if email is being updated)
    if (updateProfileDto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: updateProfileDto.email,
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateProfileDto.email && { email: updateProfileDto.email }),
        ...(updateProfileDto.firstName && { firstName: updateProfileDto.firstName }),
        ...(updateProfileDto.lastName && { lastName: updateProfileDto.lastName }),
        ...(updateProfileDto.phone && { phone: updateProfileDto.phone }),
        ...(updateProfileDto.address && { address: updateProfileDto.address }),
        ...(updateProfileDto.city && { city: updateProfileDto.city }),
        ...(updateProfileDto.state && { state: updateProfileDto.state }),
        ...(updateProfileDto.zip && { zip: updateProfileDto.zip }),
        ...(updateProfileDto.country && { country: updateProfileDto.country }),
        ...(updateProfileDto.profilePicture && { profilePicture: updateProfileDto.profilePicture }),
      },
    });

    // Remove password from return object
    const { password: _, ...result } = updatedUser;
    return result;
  }

  /**
   * Refresh auth token
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Remove password from return object
      const { password: _, ...result } = user;

      return this.generateAuthResponse(result);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user (optional - client side)
   * Note: JWT tokens cannot be invalidated unless using a blacklist/redis
   */
  async logout() {
    // JWT tokens are stateless, so logout is primarily client-side
    // For a more secure logout, implement token blacklisting with Redis
    return { success: true, message: 'Logged out successfully' };
  }

  /**
   * Generate auth response with tokens
   */
  private generateAuthResponse(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    // Create access token (short lived)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m'),
    });
    
    // Create refresh token (long lived)
    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      },
    );

    return {
      user,
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<number>('JWT_EXPIRATION_SECONDS', 900),
    };
  }

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Submit KYC document for verification
   */
  async submitKycDocument(userId: string, kycData: KycSubmissionDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { driver: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create KYC document record in database
    // Note: In a real implementation, you'd likely have a KYC document table
    // For now, we'll use the user's metadata field to store this information
    
    // Get existing metadata or initialize empty object
    const existingMetadata = user.metadata ? user.metadata as any : {};
    
    // Prepare KYC documents array if it doesn't exist
    if (!existingMetadata.kycDocuments) {
      existingMetadata.kycDocuments = [];
    }
    
    // Add new document with pending status
    existingMetadata.kycDocuments.push({
      documentType: kycData.documentType,
      documentNumber: kycData.documentNumber,
      documentImage: kycData.documentImage,
      expiryDate: kycData.expiryDate,
      additionalInfo: kycData.additionalInfo,
      status: VerificationStatus.PENDING,
      submittedAt: new Date().toISOString(),
    });

    // Update the user record
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        metadata: existingMetadata,
      },
    });

    // If this is a driver, update their verification status
    if (user.driver) {
      await this.prisma.driver.update({
        where: { id: user.driver.id },
        data: {
          verificationStatus: 'PENDING',
        },
      });
    }

    // In a real implementation, you'd trigger a verification process here
    // This could be automated or manual review
    
    return {
      success: true,
      message: 'Document submitted for verification successfully',
      documentType: kycData.documentType,
      status: VerificationStatus.PENDING,
    };
  }

  /**
   * Get all KYC documents for a user
   */
  async getUserKycDocuments(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const metadata = user.metadata as any || {};
    const kycDocuments = metadata.kycDocuments || [];

    return kycDocuments;
  }

  /**
   * Admin: Update verification status of a KYC document
   */
  async updateVerificationStatus(
    userId: string, 
    documentType: DocumentType, 
    statusUpdate: VerificationStatusUpdateDto
  ) {
    // This is an admin-only function
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { driver: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user metadata
    const metadata = user.metadata as any || {};
    const kycDocuments = metadata.kycDocuments || [];

    // Find the document
    const documentIndex = kycDocuments.findIndex(doc => doc.documentType === documentType);
    if (documentIndex === -1) {
      throw new NotFoundException(`Document of type ${documentType} not found`);
    }

    // Update the document status
    kycDocuments[documentIndex].status = statusUpdate.status;
    kycDocuments[documentIndex].reason = statusUpdate.reason;
    kycDocuments[documentIndex].message = statusUpdate.message;
    kycDocuments[documentIndex].verifiedAt = new Date().toISOString();

    // Update user metadata
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        metadata,
      },
    });

    // Check if all required documents are verified for drivers
    if (user.driver) {
      const allRequiredDocumentsApproved = this.checkAllRequiredDocumentsApproved(kycDocuments);
      
      // Update driver verification status if all documents are approved
      if (statusUpdate.status === VerificationStatus.APPROVED && allRequiredDocumentsApproved) {
        await this.prisma.driver.update({
          where: { id: user.driver.id },
          data: {
            verificationStatus: 'APPROVED',
            identityVerified: true,
          },
        });
      } else if (statusUpdate.status === VerificationStatus.REJECTED) {
        await this.prisma.driver.update({
          where: { id: user.driver.id },
          data: {
            verificationStatus: 'REJECTED',
          },
        });
      }
    }

    // In a real application, you'd send a notification to the user

    return {
      success: true,
      message: `Document verification status updated to ${statusUpdate.status}`,
      documentType,
      status: statusUpdate.status,
    };
  }

  /**
   * Check if all required documents are verified
   * This logic depends on your business requirements
   */
  private checkAllRequiredDocumentsApproved(kycDocuments: any[]): boolean {
    // Define required documents for drivers
    const requiredDocuments = [
      DocumentType.DRIVERS_LICENSE,
      DocumentType.NIN,
      DocumentType.PROFILE_PHOTO,
    ];

    // Check if all required documents exist and are approved
    return requiredDocuments.every(requiredType => {
      const document = kycDocuments.find(doc => doc.documentType === requiredType);
      return document && document.status === VerificationStatus.APPROVED;
    });
  }

  /**
   * Get verification status for a user
   */
  async getVerificationStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { driver: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // For drivers, return the driver verification status
    if (user.driver) {
      return {
        isDriver: true,
        verificationStatus: user.driver.verificationStatus,
        identityVerified: user.driver.identityVerified,
      };
    }

    // For regular users, check if they have verified identity documents
    const metadata = user.metadata as any || {};
    const kycDocuments = metadata.kycDocuments || [];
    
    const hasVerifiedIdentity = kycDocuments.some(
      doc => (doc.documentType === DocumentType.NIN || doc.documentType === DocumentType.BVN) && 
             doc.status === VerificationStatus.APPROVED
    );

    return {
      isDriver: false,
      identityVerified: hasVerifiedIdentity,
    };
  }
} 