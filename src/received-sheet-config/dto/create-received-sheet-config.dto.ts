import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReceivedSheetConfigDto {
  @IsOptional()
  @IsBoolean()
  showLogo?: boolean;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyAddress?: string;

  @IsOptional()
  @IsString()
  companyPhone?: string;

  @IsOptional()
  @IsString()
  companyEmail?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsBoolean()
  showProductDetails?: boolean;

  @IsOptional()
  @IsBoolean()
  showPaymentMethod?: boolean;

  @IsOptional()
  @IsBoolean()
  showTax?: boolean;

  @IsOptional()
  @IsString()
  footerMessage?: string;

  @IsOptional()
  @IsNumber()
  @Min(8)
  @Max(20)
  fontSize?: number;

  @IsOptional()
  @IsNumber()
  paperWidth?: number;

  @IsOptional()
  @IsString()
  mobilePosName?: string;

  @IsOptional()
  @IsString()
  mobilePinCode?: string;

  @IsOptional()
  @IsBoolean()
  mobileEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  mobileAllowOffline?: boolean;

  @IsOptional()
  @IsBoolean()
  mobileAutoSync?: boolean;
}
