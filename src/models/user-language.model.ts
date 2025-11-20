export interface UserLanguage {
  id: number;
  userId: number;
  languageCode: string; // 'fr', 'en', 'ht', 'es'
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserLanguageDto {
  userId: number;
  languageCode: string;
}

export interface UpdateUserLanguageDto {
  languageCode: string;
}
