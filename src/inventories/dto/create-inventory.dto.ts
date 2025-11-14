import { IsOptional, IsString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Theoretical quantity in system' })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value == null || value === '' ? 0 : Number(value)))
  theoreticalQuantity: number;

  @ApiPropertyOptional({ description: 'Physical quantity counted' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value == null || value === '' ? undefined : Number(value)))
  physicalQuantity?: number;

  @ApiPropertyOptional({ description: 'Notes for this item' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateInventoryDto {
  @ApiPropertyOptional({ description: 'Notes for the inventory' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'List of items to count', type: [CreateInventoryItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInventoryItemDto)
  items: CreateInventoryItemDto[];
}
