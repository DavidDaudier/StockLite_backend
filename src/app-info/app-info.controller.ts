import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppInfoService } from './app-info.service';
import { CreateAppInfoDto } from './dto/create-app-info.dto';
import { UpdateAppInfoDto } from './dto/update-app-info.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('App Info')
@Controller('app-info')
export class AppInfoController {
  constructor(private readonly appInfoService: AppInfoService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create application information' })
  @ApiResponse({ status: 201, description: 'App info created successfully.' })
  @ApiResponse({ status: 409, description: 'App info already exists.' })
  create(@Body() createAppInfoDto: CreateAppInfoDto) {
    return this.appInfoService.create(createAppInfoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get application information' })
  @ApiResponse({ status: 200, description: 'App info retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'App info not found.' })
  getAppInfo() {
    return this.appInfoService.getAppInfo();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update application information' })
  @ApiResponse({ status: 200, description: 'App info updated successfully.' })
  @ApiResponse({ status: 404, description: 'App info not found.' })
  update(@Param('id') id: string, @Body() updateAppInfoDto: UpdateAppInfoDto) {
    return this.appInfoService.update(id, updateAppInfoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete application information' })
  @ApiResponse({ status: 200, description: 'App info deleted successfully.' })
  @ApiResponse({ status: 404, description: 'App info not found.' })
  remove(@Param('id') id: string) {
    return this.appInfoService.remove(id);
  }
}
