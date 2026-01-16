import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    example: 'user@example.com', 
    description: 'The email address used during registration' 
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'MySuperPassword123!', 
    description: 'The user password' 
  })
  @IsString()
  password: string;
}