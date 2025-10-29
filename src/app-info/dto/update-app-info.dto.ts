import { PartialType } from '@nestjs/mapped-types';
import { CreateAppInfoDto } from './create-app-info.dto';

export class UpdateAppInfoDto extends PartialType(CreateAppInfoDto) {}
