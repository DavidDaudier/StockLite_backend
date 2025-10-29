import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppInfo } from './app-info.entity';
import { CreateAppInfoDto } from './dto/create-app-info.dto';
import { UpdateAppInfoDto } from './dto/update-app-info.dto';

@Injectable()
export class AppInfoService {
  constructor(
    @InjectRepository(AppInfo)
    private appInfoRepository: Repository<AppInfo>,
  ) {}

  async create(createAppInfoDto: CreateAppInfoDto): Promise<AppInfo> {
    // Check if app info already exists
    const existingAppInfo = await this.appInfoRepository.findOne({
      where: {},
    });

    if (existingAppInfo) {
      throw new ConflictException('Application information already exists. Use update endpoint instead.');
    }

    const appInfo = this.appInfoRepository.create(createAppInfoDto);
    return await this.appInfoRepository.save(appInfo);
  }

  async getAppInfo(): Promise<AppInfo> {
    // Get the first (and should be only) app info entry
    const appInfo = await this.appInfoRepository.findOne({
      where: {},
      order: { createdAt: 'ASC' },
    });

    if (!appInfo) {
      throw new NotFoundException('Application information not found. Please create it first.');
    }

    return appInfo;
  }

  async update(id: string, updateAppInfoDto: UpdateAppInfoDto): Promise<AppInfo> {
    const appInfo = await this.appInfoRepository.findOne({
      where: { id },
    });

    if (!appInfo) {
      throw new NotFoundException('Application information not found');
    }

    await this.appInfoRepository.update(id, updateAppInfoDto);
    return this.appInfoRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    const appInfo = await this.appInfoRepository.findOne({
      where: { id },
    });

    if (!appInfo) {
      throw new NotFoundException('Application information not found');
    }

    await this.appInfoRepository.delete(id);
  }
}
