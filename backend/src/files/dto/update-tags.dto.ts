import { IsArray, IsString, MaxLength, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTagsDto {
  @ApiProperty({ 
    description: 'New tag list', 
    example: ['archive', 'confidential'],
    type: [String]
  })
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @MaxLength(30, { each: true, message: 'Each tag max 30 characters' })
  @ArrayMaxSize(10, { message: 'Max 10 tags per file' })
  tags: string[];
}