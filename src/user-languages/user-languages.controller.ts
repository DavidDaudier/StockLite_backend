import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { UserLanguagesService } from './user-languages.service';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserLanguagesController {
  constructor(private readonly userLanguagesService: UserLanguagesService) {}

  @Get(':userId/language')
  getUserLanguage(@Param('userId') userId: string) {
    return this.userLanguagesService.getUserLanguage(userId);
  }

  @Put(':userId/language')
  updateUserLanguage(
    @Param('userId') userId: string,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ) {
    return this.userLanguagesService.updateUserLanguage(
      userId,
      updateLanguageDto,
    );
  }
}
