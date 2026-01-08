import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@GetUser() user: User) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  async updateMe(@GetUser() user: User, @Body() body: Partial<User>) {
    return this.usersService.updateProfile(user.id, body);
  }
}