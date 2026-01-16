import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    example: 'new@client.com', 
    description: 'Must be a valid and unique email address' 
  })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @ApiProperty({ 
    example: 'SecretPass88', 
    description: 'Strong password (minimum 8 characters)',
    minLength: 8 
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}