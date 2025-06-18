import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request, response, Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginClassDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  login(@Body() loginUserDto: LoginClassDto, @Res({passthrough: true}) response: Response) {
    return this.userService.login(loginUserDto, response);
  }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @Post('verify_token')
  verify_token(@Body() verifyTokenDto: VerifyTokenDto, @Res({passthrough: true}) response: Response) {
    return this.userService.verify_token(verifyTokenDto, response);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: Request) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
