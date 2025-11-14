import { PartialType } from '@nestjs/swagger';
import { CreateReceivedSheetConfigDto } from './create-received-sheet-config.dto';

export class UpdateReceivedSheetConfigDto extends PartialType(CreateReceivedSheetConfigDto) {}
