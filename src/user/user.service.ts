import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginClassDto } from './dto/login-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async login(loginUserDto: LoginClassDto): Promise<{message: string, user: User | null}> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginUserDto.email,
      },
    });
    if (!user) {
      return {message: "User not found", user: null}
    }
    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password)
    if (!isPasswordValid){
      return {message: "Invalid password", user: null}
    }
    return {message: 'User logged in successfully', user: user};
  }

  async register(createUserDto: CreateUserDto) : Promise<{message: string, user: User}> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto, password: hashedPassword
      },
    });
    return {message: 'User created successfully', user};
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
