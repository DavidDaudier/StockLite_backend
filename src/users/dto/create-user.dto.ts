import { IsString, IsEmail, IsNotEmpty, IsEnum, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'Nom d\'utilisateur unique', example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({ description: 'Adresse email', example: 'john.doe@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Mot de passe', example: 'SecurePass123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ description: 'Nom complet', example: 'John Doe' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Rôle de l\'utilisateur',
    enum: UserRole,
    default: UserRole.SELLER,
    example: UserRole.SELLER
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Permissions - pour vendeurs: {page: boolean}, pour admins: {page: {create, read, update, delete}}',
    example: {
      dashboard: true,
      pos: true,
      history: true,
      reports: true,
      profile: true
    }
  })
  @IsObject()
  @IsOptional()
  permissions?: any;

  @ApiPropertyOptional({
    description: 'Marquer comme Super Admin (accès total)',
    default: false,
    example: false
  })
  @IsBoolean()
  @IsOptional()
  isSuperAdmin?: boolean;
}
