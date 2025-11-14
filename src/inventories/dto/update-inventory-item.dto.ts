import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInventoryItemDto {
  @ApiPropertyOptional({ description: 'Physical quantity counted' })
  @IsOptional()
  @IsNumber()
  physicalQuantity?: number;

  @ApiPropertyOptional({ description: 'Notes for this item' })
  @IsOptional()
  @IsString()
  notes?: string;
}
