import { IsOptional, IsString, IsInt, Min, Max, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadOptionsDto {
  @IsOptional()
  @IsString()
  @Length(6, 255)
  password?: string;

  @IsOptional()
  @Type(() => Number) 
  @IsInt()
  @Min(1)
  @Max(7)
  expirationDays?: number = 7;

  @IsOptional()
  tags?: string[];
}