import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody 
} from '@nestjs/swagger';

@ApiTags('Utilisateurs')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Retrieve my logged-in profile' })
  @ApiResponse({ status: 200, description: 'Returns user information.' })
  async getMe(@GetUser() user: User) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile (Email)' })
  @ApiResponse({ status: 200, description: 'Updated profile.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'new@email.com' }
      }
    }
  })
  async updateMe(@GetUser() user: User, @Body() body: Partial<User>) {
    return this.usersService.updateProfile(user.id, body);
  }
}