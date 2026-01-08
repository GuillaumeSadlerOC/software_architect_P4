import { IsArray, IsString, MaxLength, ArrayMaxSize } from 'class-validator';

export class UpdateTagsDto {
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @MaxLength(30, { each: true, message: 'Each tag max 30 characters' })
  @ArrayMaxSize(10, { message: 'Max 10 tags per file' })
  tags: string[];
}