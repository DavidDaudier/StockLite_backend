import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DeletionRequestStatus } from '../deletion-request.entity';

export class UpdateDeletionRequestDto {
  @IsEnum(DeletionRequestStatus)
  status: DeletionRequestStatus;

  @IsString()
  @IsOptional()
  adminResponse?: string;
}
