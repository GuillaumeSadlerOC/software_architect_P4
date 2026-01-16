import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DownloadDto {
  @ApiProperty({
    description: 'Password required if the file is protected',
    required: false,
    example: 'Secret123',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}