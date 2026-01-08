import { IsInt, Min, Max } from 'class-validator';

export class UpdateExpirationDto {
  @IsInt()
  @Min(1)
  @Max(7)
  expirationDays: number;
}