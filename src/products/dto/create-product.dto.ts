import { IsString, IsNumber, IsNotEmpty, IsOptional, Min, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Nom du produit', example: 'iPhone 14 Pro' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description du produit', example: 'Smartphone haut de gamme' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Code SKU unique du produit', example: 'IP14P-256-BLK' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiPropertyOptional({ description: 'Code-barres du produit', example: '1234567890123' })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ description: 'Prix de vente', example: 1299.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Prix d\'achat/coût', example: 899.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @ApiProperty({ description: 'Quantité en stock', example: 50, minimum: 0 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: 'Seuil minimal de stock', example: 10, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minStock?: number;

  @ApiPropertyOptional({ description: 'Catégorie du produit', example: 'Smartphones' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Marque du produit', example: 'Apple' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ description: 'Modèle du produit', example: 'iPhone 14 Pro' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ description: 'URL de l\'image du produit', example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Statut d\'activité du produit', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
