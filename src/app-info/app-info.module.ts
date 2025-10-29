import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppInfoService } from './app-info.service';
import { AppInfoController } from './app-info.controller';
import { AppInfo } from './app-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppInfo])],
  controllers: [AppInfoController],
  providers: [AppInfoService],
  exports: [AppInfoService],
})
export class AppInfoModule {}
