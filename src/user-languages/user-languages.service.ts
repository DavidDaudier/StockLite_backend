import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLanguage } from './user-language.entity';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Injectable()
export class UserLanguagesService {
  constructor(
    @InjectRepository(UserLanguage)
    private userLanguagesRepository: Repository<UserLanguage>,
  ) {}

  async getUserLanguage(userId: string): Promise<{ languageCode: string }> {
    let userLanguage = await this.userLanguagesRepository.findOne({
      where: { userId },
    });

    if (!userLanguage) {
      // Créer une entrée par défaut si elle n'existe pas
      userLanguage = this.userLanguagesRepository.create({
        userId,
        languageCode: 'fr',
      });
      await this.userLanguagesRepository.save(userLanguage);
    }

    return { languageCode: userLanguage.languageCode };
  }

  async updateUserLanguage(
    userId: string,
    updateLanguageDto: UpdateLanguageDto,
  ): Promise<{ success: boolean; languageCode: string; message: string }> {
    const { languageCode } = updateLanguageDto;

    // Vérifier si l'entrée existe
    let userLanguage = await this.userLanguagesRepository.findOne({
      where: { userId },
    });

    if (userLanguage) {
      // Mettre à jour
      userLanguage.languageCode = languageCode;
      await this.userLanguagesRepository.save(userLanguage);
    } else {
      // Créer
      userLanguage = this.userLanguagesRepository.create({
        userId,
        languageCode,
      });
      await this.userLanguagesRepository.save(userLanguage);
    }

    return {
      success: true,
      languageCode,
      message: 'Language preference updated successfully',
    };
  }
}
