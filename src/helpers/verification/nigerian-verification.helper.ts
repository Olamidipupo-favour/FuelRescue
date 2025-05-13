import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/**
 * Nigerian Verification Helper - Provides verification functions for Nigerian identity documents
 * This is a general helper that can be used anywhere in the application
 */
@Injectable()
export class NigerianVerificationHelper {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('VERIFICATION_API_KEY', '');
    this.baseUrl = this.configService.get<string>('VERIFICATION_API_URL', 'https://api.youverify.co');
  }
  
  /**
   * Primary verification methods (NIN, BVN)
   * @param meansOfId The type of identification ('nin' or 'bvn')
   * @param regNo The identification number
   * @returns The verification result
   */
  public async primaryVerification(meansOfId: string, regNo: string): Promise<any> {
    try {
      if (meansOfId === 'nin') {
        const result = await this.verifyNin(regNo);
        
        if (!result.success) {
          throw new BadRequestException({
            message: 'Please ensure that your NIN is correct. Try again',
          });
        }
        
        if (result.data.status !== 'found') {
          throw new BadRequestException({
            message: 'Invalid NIN. Make sure you cross-check and input a valid NIN',
          });
        }
        
        return result;
      } else if (meansOfId === 'bvn') {
        const result = await this.verifyBvn(regNo);
        
        if (!result.success) {
          throw new BadRequestException({
            message: 'Please ensure that your BVN is correct. Try again',
          });
        }
        
        return result;
      } else {
        throw new BadRequestException({
          message: 'Please choose another means of identification',
        });
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException({
        message: `An error occurred during ${meansOfId.toUpperCase()} verification`,
        details: error.message
      });
    }
  }
  
  /**
   * Secondary verification methods (Driver's License, Voter's Card)
   * @param meansOfId The type of identification ('driver's license' or 'voter's card')
   * @param regNo The identification number
   * @returns The verification result
   */
  public async secondaryVerification(meansOfId: string, regNo: string): Promise<any> {
    try {
      if (meansOfId === "driver's license") {
        const result = await this.verifyDriversLicense(regNo);
        
        if (!result.success) {
          throw new BadRequestException({
            message: "Please ensure that your Driver's license reg number is correct. Try again",
          });
        }
        
        if (result.data.status !== 'found') {
          throw new BadRequestException({
            message: "Invalid Driver's License reg number. Make sure you cross-check and input a valid Reg No",
          });
        }
        
        return result;
      } else if (meansOfId === "voter's card") {
        const result = await this.verifyVotersCard(regNo);
        
        if (!result.success) {
          throw new BadRequestException({
            message: "Please ensure that your voter's card reg number is correct. Try again",
          });
        }
        
        return result;
      } else {
        throw new BadRequestException({
          message: 'Please choose another means of identification',
        });
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException({
        message: `An error occurred during ${meansOfId.toUpperCase()} verification`,
        details: error.message
      });
    }
  }
  
  /**
   * Internal method to verify NIN
   * @param nin The NIN to verify
   * @returns The verification result
   */
  private async verifyNin(nin: string): Promise<any> {
    try {
      return await this.callVerificationApi('nin', { nin });
    } catch (error) {
      console.error('NIN verification error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Internal method to verify BVN
   * @param bvn The BVN to verify
   * @returns The verification result
   */
  private async verifyBvn(bvn: string): Promise<any> {
    try {
      return await this.callVerificationApi('bvn', { bvn });
    } catch (error) {
      console.error('BVN verification error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Internal method to verify Driver's License
   * @param licenseNumber The Driver's License number to verify
   * @returns The verification result
   */
  private async verifyDriversLicense(licenseNumber: string): Promise<any> {
    try {
      return await this.callVerificationApi('drivers_license', { id: licenseNumber });
    } catch (error) {
      console.error("Driver's license verification error:", error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Internal method to verify Voter's Card
   * @param voterId The Voter's Card ID to verify
   * @returns The verification result
   */
  private async verifyVotersCard(voterId: string): Promise<any> {
    try {
      return await this.callVerificationApi('voters_card', { id: voterId });
    } catch (error) {
      console.error("Voter's card verification error:", error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Call the verification API
   * @param type The type of verification
   * @param data The data to verify
   * @returns The API response
   */
  private async callVerificationApi(type: string, data: Record<string, any>): Promise<any> {
    try {
      let endpoint = '';
      switch (type) {
        case 'nin':
          endpoint = '/v2/biometrics/merchant/data/verification/nin';
          break;
        case 'bvn':
          endpoint = '/v2/biometrics/merchant/data/verification/bvn';
          break;
        case 'drivers_license':
          endpoint = '/v2/biometrics/merchant/data/verification/drivers_license';
          break;
        case 'voters_card':
          endpoint = '/v2/biometrics/merchant/data/verification/voters_card';
          break;
        default:
          throw new Error(`Unknown verification type: ${type}`);
      }

      // Check if we're in development mode
      const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
      
      // Use mock response in development mode or if API key is not provided
      if (isDev || !this.apiKey) {
        return this.getMockResponse(type, data);
      }
      
      // Make actual API call in production
      const response = await axios.post(`${this.baseUrl}${endpoint}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Verification API error:', error);
      return { success: false, error: 'Verification API error' };
    }
  }
  
  /**
   * Get a mock response for testing
   * @param type The type of verification
   * @param data The data used for verification
   * @returns A mock response
   */
  private getMockResponse(type: string, data: Record<string, any>): any {
    // In production, this would be replaced with actual API calls
    return {
      success: true,
      data: {
        status: 'found',
        first_name: 'John',
        last_name: 'Doe',
        dob: '1990-01-01',
        gender: 'male',
        ...data,
      },
    };
  }
} 