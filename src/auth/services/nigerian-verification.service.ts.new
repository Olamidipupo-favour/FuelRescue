import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { NigerianVerificationHelper } from '../../helpers/verification/nigerian-verification.helper';
import { DocumentType } from '../dto/kyc-submission.dto';
import { VerificationStatus } from '../dto/verification-status-update.dto';
import { NotificationService } from '../../notifications/notification.service';

@Injectable()
export class NigerianVerificationService {
  constructor(
    private nigerianVerification: NigerianVerificationHelper,
    private prisma: PrismaService,
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Verify NIN document
   */
  async verifyNin(userId: string, nin: string) {
    try {
      // Attempt to verify the NIN using the primary verification method
      const verificationResult = await this.nigerianVerification.primaryVerification('nin', nin);
      
      if (!verificationResult.success || verificationResult.data.status !== 'found') {
        // Update document status in user metadata
        await this.updateDocumentStatus(
          userId, 
          DocumentType.NIN, 
          VerificationStatus.REJECTED,
          'Invalid NIN',
          verificationResult.error || 'NIN verification failed'
        );

        return {
          success: false,
          status: VerificationStatus.REJECTED,
          message: verificationResult.error || 'NIN verification failed',
        };
      }

      // Update document status in user metadata
      await this.updateDocumentStatus(
        userId,
        DocumentType.NIN,
        VerificationStatus.APPROVED,
        'NIN verified successfully',
        'Your NIN has been verified successfully'
      );

      // If user is a driver, update verification status
      await this.updateDriverStatus(userId);
      
      // Send notification to user
      await this.sendVerificationNotification(
        userId,
        'NIN Verification',
        'Your NIN has been verified successfully'
      );

      return {
        success: true,
        status: VerificationStatus.APPROVED,
        message: 'NIN verified successfully',
        data: verificationResult.data,
      };
    } catch (error) {
      // Log error
      console.error('Error verifying NIN:', error);
      
      // Update document status in user metadata
      await this.updateDocumentStatus(
        userId,
        DocumentType.NIN,
        VerificationStatus.REJECTED,
        'Verification error',
        error.message || 'An error occurred during verification'
      );

      return {
        success: false,
        status: VerificationStatus.REJECTED,
        message: error.message || 'An error occurred during verification',
      };
    }
  }

  /**
   * Verify BVN document
   */
  async verifyBvn(userId: string, bvn: string) {
    try {
      // Attempt to verify the BVN using the primary verification method
      const verificationResult = await this.nigerianVerification.primaryVerification('bvn', bvn);
      
      if (!verificationResult.success) {
        // Update document status in user metadata
        await this.updateDocumentStatus(
          userId, 
          DocumentType.BVN, 
          VerificationStatus.REJECTED,
          'Invalid BVN',
          verificationResult.error || 'BVN verification failed'
        );

        return {
          success: false,
          status: VerificationStatus.REJECTED,
          message: verificationResult.error || 'BVN verification failed',
        };
      }

      // Update document status in user metadata
      await this.updateDocumentStatus(
        userId,
        DocumentType.BVN,
        VerificationStatus.APPROVED,
        'BVN verified successfully',
        'Your BVN has been verified successfully'
      );
      
      // Send notification to user
      await this.sendVerificationNotification(
        userId,
        'BVN Verification',
        'Your BVN has been verified successfully'
      );

      return {
        success: true,
        status: VerificationStatus.APPROVED,
        message: 'BVN verified successfully',
        data: verificationResult.data,
      };
    } catch (error) {
      // Log error
      console.error('Error verifying BVN:', error);
      
      // Update document status in user metadata
      await this.updateDocumentStatus(
        userId,
        DocumentType.BVN,
        VerificationStatus.REJECTED,
        'Verification error',
        error.message || 'An error occurred during verification'
      );

      return {
        success: false,
        status: VerificationStatus.REJECTED,
        message: error.message || 'An error occurred during verification',
      };
    }
  }

  /**
   * Verify driver's license
   */
  async verifyDriversLicense(userId: string, licenseNumber: string) {
    try {
      // Attempt to verify the driver's license using the secondary verification method
      const verificationResult = await this.nigerianVerification.secondaryVerification("driver's license", licenseNumber);
      
      if (!verificationResult.success || verificationResult.data.status !== 'found') {
        // Update document status in user metadata
        await this.updateDocumentStatus(
          userId, 
          DocumentType.DRIVERS_LICENSE, 
          VerificationStatus.REJECTED,
          'Invalid driver\'s license',
          verificationResult.error || 'Driver\'s license verification failed'
        );

        return {
          success: false,
          status: VerificationStatus.REJECTED,
          message: verificationResult.error || 'Driver\'s license verification failed',
        };
      }

      // Update document status in user metadata
      await this.updateDocumentStatus(
        userId,
        DocumentType.DRIVERS_LICENSE,
        VerificationStatus.APPROVED,
        'Driver\'s license verified successfully',
        'Your driver\'s license has been verified successfully'
      );

      // If user is a driver, update verification status
      await this.updateDriverStatus(userId);
      
      // Send notification to user
      await this.sendVerificationNotification(
        userId,
        'Driver\'s License Verification',
        'Your driver\'s license has been verified successfully'
      );

      return {
        success: true,
        status: VerificationStatus.APPROVED,
        message: 'Driver\'s license verified successfully',
        data: verificationResult.data,
      };
    } catch (error) {
      // Log error
      console.error('Error verifying driver\'s license:', error);
      
      // Update document status in user metadata
      await this.updateDocumentStatus(
        userId,
        DocumentType.DRIVERS_LICENSE,
        VerificationStatus.REJECTED,
        'Verification error',
        error.message || 'An error occurred during verification'
      );

      return {
        success: false,
        status: VerificationStatus.REJECTED,
        message: error.message || 'An error occurred during verification',
      };
    }
  }

  /**
   * Verify voter's card
   */
  async verifyVotersCard(userId: string, votersCardNumber: string) {
    try {
      // Attempt to verify the voter's card using the secondary verification method
      const verificationResult = await this.nigerianVerification.secondaryVerification("voter's card", votersCardNumber);
      
      if (!verificationResult.success) {
        // Update document status in user metadata
        await this.updateDocumentStatus(
          userId, 
          DocumentType.VOTERS_CARD, 
          VerificationStatus.REJECTED,
          'Invalid voter\'s card',
          verificationResult.error || 'Voter\'s card verification failed'
        );

        return {
          success: false,
          status: VerificationStatus.REJECTED,
          message: verificationResult.error || 'Voter\'s card verification failed',
        };
      }

      // Update document status in user metadata
      await this.updateDocumentStatus(
        userId,
        DocumentType.VOTERS_CARD,
        VerificationStatus.APPROVED,
        'Voter\'s card verified successfully',
        'Your voter\'s card has been verified successfully'
      );
      
      // Send notification to user
      await this.sendVerificationNotification(
        userId,
        'Voter\'s Card Verification',
        'Your voter\'s card has been verified successfully'
      );

      return {
        success: true,
        status: VerificationStatus.APPROVED,
        message: 'Voter\'s card verified successfully',
        data: verificationResult.data,
      };
    } catch (error) {
      // Log error
      console.error('Error verifying voter\'s card:', error);
      
      // Update document status in user metadata
      await this.updateDocumentStatus(
        userId,
        DocumentType.VOTERS_CARD,
        VerificationStatus.REJECTED,
        'Verification error',
        error.message || 'An error occurred during verification'
      );

      return {
        success: false,
        status: VerificationStatus.REJECTED,
        message: error.message || 'An error occurred during verification',
      };
    }
  }

  /**
   * Update document status in user metadata
   */
  private async updateDocumentStatus(
    userId: string,
    documentType: DocumentType,
    status: VerificationStatus,
    reason: string,
    message: string
  ) {
    // Get user and metadata
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const metadata = user.metadata as any || {};
    const kycDocuments = metadata.kycDocuments || [];

    // Find the document
    const documentIndex = kycDocuments.findIndex(doc => doc.documentType === documentType);
    
    if (documentIndex === -1) {
      // Document doesn't exist, create it
      kycDocuments.push({
        documentType,
        status,
        reason,
        message,
        verifiedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
      });
    } else {
      // Update existing document
      kycDocuments[documentIndex].status = status;
      kycDocuments[documentIndex].reason = reason;
      kycDocuments[documentIndex].message = message;
      kycDocuments[documentIndex].verifiedAt = new Date().toISOString();
    }

    // Update user metadata
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        metadata: {
          ...metadata,
          kycDocuments,
        },
      },
    });
  }

  /**
   * Update driver verification status if all required documents are verified
   */
  private async updateDriverStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { driver: true },
    });

    if (!user || !user.driver) {
      return; // Not a driver, nothing to update
    }

    const metadata = user.metadata as any || {};
    const kycDocuments = metadata.kycDocuments || [];

    // Define required documents for drivers
    const requiredDocuments = [
      DocumentType.DRIVERS_LICENSE,
      DocumentType.NIN,
      DocumentType.PROFILE_PHOTO,
    ];

    // Check if all required documents are approved
    const allRequiredDocumentsApproved = requiredDocuments.every(requiredType => {
      const document = kycDocuments.find(doc => doc.documentType === requiredType);
      return document && document.status === VerificationStatus.APPROVED;
    });

    // Update driver verification status if all documents are approved
    if (allRequiredDocumentsApproved) {
      await this.prisma.driver.update({
        where: { id: user.driver.id },
        data: {
          verificationStatus: 'APPROVED',
          identityVerified: true,
        },
      });

      // Send notification that driver is fully verified
      await this.sendVerificationNotification(
        userId,
        'Driver Verification Complete',
        'Congratulations! Your driver account has been fully verified.'
      );
    }
  }

  /**
   * Send notification to user about verification
   */
  private async sendVerificationNotification(userId: string, title: string, message: string) {
    try {
      await this.notificationService.sendNotification({
        userId,
        type: 'VERIFICATION',
        title,
        message,
        storeInDatabase: true,
        sendEmail: true,
        sendPush: true,
        metadata: {
          verificationEvent: true
        }
      });
    } catch (error) {
      console.error('Failed to send verification notification:', error);
    }
  }
} 