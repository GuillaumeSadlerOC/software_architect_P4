import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateExpirationDto {
  @ApiProperty({ example: 3, minimum: 1, maximum: 7, description: 'Days remaining before deletion' })
  @IsInt()
  @Min(1)
  @Max(7)
  expirationDays: number;
}