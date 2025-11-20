import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle notification' })
  @ApiResponse({ status: 201, description: 'La notification a été créée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les notifications' })
  @ApiResponse({ status: 200, description: 'Liste des notifications récupérée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get('unread')
  @ApiOperation({ summary: 'Récupérer les notifications non lues' })
  @ApiResponse({ status: 200, description: 'Liste des notifications non lues.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  findUnread() {
    return this.notificationsService.findUnread();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une notification par ID' })
  @ApiParam({ name: 'id', description: 'ID de la notification' })
  @ApiResponse({ status: 200, description: 'Notification trouvée.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée.' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  @ApiParam({ name: 'id', description: 'ID de la notification' })
  @ApiResponse({ status: 200, description: 'Notification marquée comme lue.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée.' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  @ApiResponse({ status: 200, description: 'Toutes les notifications ont été marquées comme lues.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  markAllAsRead() {
    return this.notificationsService.markAllAsRead();
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Supprimer une notification' })
  @ApiParam({ name: 'id', description: 'ID de la notification' })
  @ApiResponse({ status: 200, description: 'Notification supprimée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN.' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée.' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  @Post('clean-old')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Nettoyer les anciennes notifications (30 jours+)' })
  @ApiResponse({ status: 200, description: 'Anciennes notifications nettoyées.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN.' })
  cleanOldNotifications() {
    return this.notificationsService.cleanOldNotifications();
  }
}
