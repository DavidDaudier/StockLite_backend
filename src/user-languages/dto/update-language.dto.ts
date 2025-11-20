import { IsString, IsIn } from 'class-validator';

export class UpdateLanguageDto {
  @IsString()
  @IsIn(['fr', 'en', 'ht', 'es'], {
    message: 'Language code must be one of: fr, en, ht, es',
  })
  languageCode: string;
}
