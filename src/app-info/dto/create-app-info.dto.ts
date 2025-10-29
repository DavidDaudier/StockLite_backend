import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppInfoDto {
  @ApiPropertyOptional({ description: 'Application logo URL or base64' })
  @IsString()
  @IsOptional()
  logo_app?: string;

  @ApiProperty({ description: 'Application name', example: 'StockLite' })
  @IsString()
  @IsNotEmpty()
  nom_app: string;

  @ApiPropertyOptional({ description: 'Application email', example: 'contact@stocklite.com' })
  @IsString()
  @IsOptional()
  email_app?: string;

  @ApiPropertyOptional({ description: 'Application address', example: 'Port-au-Prince, Haïti' })
  @IsString()
  @IsOptional()
  adresse_app?: string;

  @ApiPropertyOptional({ description: 'Application phone number', example: '+509 1234-5678' })
  @IsString()
  @IsOptional()
  phone_app?: string;

  @ApiPropertyOptional({ description: 'Primary color (hex)', example: '#0d9488' })
  @IsString()
  @IsOptional()
  color_primary?: string;

  @ApiPropertyOptional({ description: 'Secondary color (hex)', example: '#14b8a6' })
  @IsString()
  @IsOptional()
  color_secondary?: string;

  @ApiPropertyOptional({ description: 'Tertiary color (hex)', example: '#2dd4bf' })
  @IsString()
  @IsOptional()
  color_tertiary?: string;
}
