import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { User } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { createSession } from './sessions/session';
import { LoginClassDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { verifyToken } from 'src/services/otplib/connection';
import { generateToken } from 'src/services/otplib/connection';
import { sendMessage } from 'src/services/nodemailer/connection';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async login(
    loginUserDto: LoginClassDto,
    response: Response,
  ): Promise<{
    message: string;
    user: User | null;
    verificationCode?: string;
  }> {
    let user: User | null = null;
    const { email = '', phone = '' } = loginUserDto;
    if (email) {
      user = await this.prisma.user.findUnique({
        where: {
          email: loginUserDto.email,
        },
      });
    } else if (phone) {
      user = await this.prisma.user.findFirst({
        where: {
          phone: loginUserDto.phone,
        },
      });
    }
    if (!user) {
      return { message: 'User not found', user: null };
    }
    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      return { message: 'Invalid password', user: null };
    }

    if (phone) {
      // Generate a 6-digit verification code
      const { token: verificationCode, secret } = await generateToken();
      await sendMessage(user.email, 'Email verification code', secret);
      // Store the verification code in the database with an expiration time
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          verificationCode: secret,
          verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      });
      response.setHeader('Location', '/verify-token');
      return {
        message: 'Verification code sent to your email',
        user: user,
        verificationCode,
      };
    }
    const expiredAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const userId = user.id;
    const { id, expires } = await createSession(userId, expiredAt);
    response.cookie(
      'sessionId',
      { id, expires, userId },
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 2 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
      },
    );
    return { message: 'User logged in successfully', user: user };
  }

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ message: string; user: User }> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
    return { message: 'User created successfully', user };
  }

  async verify_token(verifyTokenDto: VerifyTokenDto, response: Response) {
    const { userId, token } = verifyTokenDto;
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        verificationCodeExpires: {
          gt: new Date(Date.now()),
        },
      },
      select: {
        verificationCode: true,
      },
    });
    if (!user?.verificationCode) {
      return { message: 'Verification code has expired', isValid: false };
    }
    const { verificationCode } = user;
    const isValid = await verifyToken({ token, secret: verificationCode });
    if (isValid) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          verificationCode: null,
          verificationCodeExpires: null,
        },
      });
      const { id, expires } = await createSession(
        userId,
        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      );

      response.cookie(
        'sessionId',
        { id, expires, userId },
        {
          httpOnly: true,
          maxAge: 2 * 24 * 60 * 60 * 1000,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        },
      );
    }
    return { message: 'Verification code is valid', isValid };
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
