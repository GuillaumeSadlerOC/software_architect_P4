import { IsOptional, IsString, IsInt, Min, Max, Length, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UploadOptionsDto {
  @ApiProperty({ 
    description: 'Optional password to protect the file', 
    required: false,
    example: 'Secret123',
    minLength: 6
  })
  @IsOptional()
  @IsString()
  @Length(6, 255)
  password?: string;

  @ApiProperty({ 
    description: 'File lifespan in days (1 to 7)', 
    required: false,
    default: 7,
    minimum: 1,
    maximum: 7
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  expirationDays?: number = 7;

  @ApiProperty({ 
    description: 'List of tags separated by commas (e.g., "project,v1")', 
    required: false,
    type: [String],
    example: ['holiday', '2024']
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}