import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Titre de la notification' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Message de la notification' })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Type de notification',
    enum: NotificationType,
    default: NotificationType.INFO
  })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @ApiProperty({ description: 'Notification lue ou non', default: false })
  @IsBoolean()
  @IsOptional()
  read?: boolean;

  @ApiProperty({ description: 'ID de l\'utilisateur concerné', required: false })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'ID du produit associé', required: false })
  @IsString()
  @IsOptional()
  productId?: string;
}
