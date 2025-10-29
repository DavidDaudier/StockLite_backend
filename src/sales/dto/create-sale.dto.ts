import { IsString, IsNumber, IsEnum, IsOptional, IsArray, ValidateNested, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../sale.entity';

export class CreateSaleItemDto {
  @ApiProperty({ description: 'ID du produit', example: 'uuid-product-123' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Quantité vendue', example: 2, minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Prix unitaire', example: 1299.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Remise sur l\'article', example: 50, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;
}

export class CreateSaleDto {
  @ApiProperty({
    description: 'Liste des articles vendus',
    type: [CreateSaleItemDto],
    example: [
      {
        productId: 'uuid-product-123',
        quantity: 2,
        unitPrice: 1299.99,
        discount: 0
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @ApiPropertyOptional({ description: 'Remise globale sur la vente', example: 100, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ description: 'Taxe appliquée', example: 18, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  tax?: number;

  @ApiProperty({
    description: 'Méthode de paiement',
    enum: PaymentMethod,
    example: PaymentMethod.CASH
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: 'Nom du client', example: 'Jean Dupont' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Téléphone du client', example: '+221771234567' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'Notes additionnelles', example: 'Client VIP' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'ID de la vente côté client (pour sync offline)', example: 'local-uuid-456' })
  @IsString()
  @IsOptional()
  clientSaleId?: string;
}
