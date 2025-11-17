import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDeletionRequestDto {
  @IsUUID()
  @IsNotEmpty()
  saleId: string;

  @IsString()
  saleTicketNo: string;

  @IsArray()
  @IsNotEmpty()
  reasons: string[];

  @IsString()
  @IsNotEmpty()
  description: string;
}
