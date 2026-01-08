import { IsOptional, IsString, MinLength } from 'class-validator';

export class DownloadDto {
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}