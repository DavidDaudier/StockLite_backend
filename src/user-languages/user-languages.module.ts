import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLanguagesService } from './user-languages.service';
import { UserLanguagesController } from './user-languages.controller';
import { UserLanguage } from './user-language.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserLanguage])],
  controllers: [UserLanguagesController],
  providers: [UserLanguagesService],
  exports: [UserLanguagesService],
})
export class UserLanguagesModule {}
