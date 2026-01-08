import { IsOptional, IsString, IsInt, Min, Max, Length, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

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