import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid data (email already taken, etc.).' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in and retrieve a JWT token' })
  @ApiResponse({ status: 200, description: 'Connection successful.' })
  @ApiResponse({ status: 401, description: 'Incorrect email or password.' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    if (!result) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return result;
  }
}