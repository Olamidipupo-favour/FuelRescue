import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Patch,
  HttpCode,
  HttpStatus,
  Query,
  Param
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';
import { KycSubmissionDto, DocumentType } from './dto/kyc-submission.dto';
import { VerificationStatusUpdateDto } from './dto/verification-status-update.dto';
import { NigerianVerificationService } from './services/nigerian-verification.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly nigerianVerificationService: NigerianVerificationService,
  ) {}

  /**
   * Login with email and password
   * @returns JWT tokens and user data
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Register a new user
   * @returns JWT tokens and user data
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Request password reset link/token
   * @returns Success message
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  /**
   * Reset password with token
   * @returns Success message
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * Refresh access token using refresh token
   * @returns New JWT tokens
   */
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  /**
   * Log out a user (mostly client-side)
   * @returns Success message
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    return this.authService.logout();
  }

  /**
   * Get current user profile
   * @returns User profile data
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  /**
   * Update current user profile
   * @returns Updated user profile
   */
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.userId, updateProfileDto);
  }

  /**
   * Change password (requires current password)
   * @returns Success message
   */
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userId, changePasswordDto);
  }

  /**
   * Admin-only: Get all users (for admin dashboard)
   * This is a protected endpoint only for admins
   * @returns List of users
   */
  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAllUsers(@Query('page') page = 1, @Query('limit') limit = 10) {
    // Implementation for admin to get all users
    // This would be implemented in the auth service
    return { message: 'Admin-only endpoint (to be implemented)' };
  }

  /**
   * Admin-only: Get specific user by ID
   * This is a protected endpoint only for admins
   * @returns User data
   */
  @Get('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getUser(@Param('id') id: string) {
    // Implementation for admin to get a specific user
    // This would be implemented in the auth service
    return { message: 'Admin-only endpoint (to be implemented)', userId: id };
  }

  /**
   * Submit KYC document for verification
   * @returns Success message and status
   */
  @Post('kyc/submit')
  @UseGuards(JwtAuthGuard)
  async submitKycDocument(@Request() req, @Body() kycData: KycSubmissionDto) {
    return this.authService.submitKycDocument(req.user.userId, kycData);
  }

  /**
   * Get all KYC documents for the current user
   * @returns List of submitted KYC documents
   */
  @Get('kyc/documents')
  @UseGuards(JwtAuthGuard)
  async getMyKycDocuments(@Request() req) {
    return this.authService.getUserKycDocuments(req.user.userId);
  }

  /**
   * Get verification status for the current user
   * @returns Verification status
   */
  @Get('kyc/status')
  @UseGuards(JwtAuthGuard)
  async getMyVerificationStatus(@Request() req) {
    return this.authService.getVerificationStatus(req.user.userId);
  }

  /**
   * Admin: Update verification status of a KYC document
   * @returns Success message and status
   */
  @Patch('kyc/:userId/documents/:documentType')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateVerificationStatus(
    @Param('userId') userId: string,
    @Param('documentType') documentType: DocumentType,
    @Body() statusUpdate: VerificationStatusUpdateDto
  ) {
    return this.authService.updateVerificationStatus(userId, documentType, statusUpdate);
  }

  /**
   * Admin: Get all KYC documents for a specific user
   * @returns List of KYC documents
   */
  @Get('kyc/:userId/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getUserKycDocuments(@Param('userId') userId: string) {
    return this.authService.getUserKycDocuments(userId);
  }

  /**
   * Admin: Get verification status for a specific user
   * @returns Verification status
   */
  @Get('kyc/:userId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getUserVerificationStatus(@Param('userId') userId: string) {
    return this.authService.getVerificationStatus(userId);
  }

  /**
   * Verify Nigerian NIN
   * @returns Verification result
   */
  @Post('verify/nin')
  @UseGuards(JwtAuthGuard)
  async verifyNin(@Request() req, @Body('nin') nin: string) {
    return this.nigerianVerificationService.verifyNin(req.user.userId, nin);
  }

  /**
   * Verify Nigerian BVN
   * @returns Verification result
   */
  @Post('verify/bvn')
  @UseGuards(JwtAuthGuard)
  async verifyBvn(@Request() req, @Body('bvn') bvn: string) {
    return this.nigerianVerificationService.verifyBvn(req.user.userId, bvn);
  }

  /**
   * Verify Nigerian Driver's License
   * @returns Verification result
   */
  @Post('verify/drivers-license')
  @UseGuards(JwtAuthGuard)
  async verifyDriversLicense(@Request() req, @Body('licenseNumber') licenseNumber: string) {
    return this.nigerianVerificationService.verifyDriversLicense(req.user.userId, licenseNumber);
  }

  /**
   * Verify Nigerian Voter's Card
   * @returns Verification result
   */
  @Post('verify/voters-card')
  @UseGuards(JwtAuthGuard)
  async verifyVotersCard(@Request() req, @Body('votersCardNumber') votersCardNumber: string) {
    return this.nigerianVerificationService.verifyVotersCard(req.user.userId, votersCardNumber);
  }
} 