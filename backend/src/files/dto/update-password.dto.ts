import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'NewPass456!', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}