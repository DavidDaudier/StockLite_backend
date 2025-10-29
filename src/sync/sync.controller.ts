import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Sync')
@ApiBearerAuth('JWT-auth')
@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Statut de la file de synchronisation',
    description: 'Récupère l\'état actuel de la file de synchronisation.'
  })
  @ApiResponse({ status: 200, description: 'Statut de la queue récupéré avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  getQueueStatus() {
    return this.syncService.getQueueStatus();
  }

  @Post('process')
  @ApiOperation({
    summary: 'Traiter la file de synchronisation',
    description: 'Lance le traitement de tous les éléments en attente dans la file de synchronisation.'
  })
  @ApiResponse({ status: 200, description: 'File de synchronisation traitée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  async processQueue() {
    const result = await this.syncService.processSyncQueue();
    return {
      message: 'File de synchronisation traitée',
      ...result,
    };
  }

  @Get('unsynced-sales')
  @ApiOperation({
    summary: 'Récupérer les ventes non synchronisées',
    description: 'Récupère toutes les ventes qui n\'ont pas encore été synchronisées avec le serveur.'
  })
  @ApiResponse({ status: 200, description: 'Ventes non synchronisées récupérées avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  getUnsyncedSales() {
    return this.syncService.getUnsyncedSales();
  }

  @Post('batch-sync-sales')
  @ApiOperation({
    summary: 'Synchroniser plusieurs ventes en batch',
    description: 'Marque plusieurs ventes comme synchronisées et notifie tous les clients connectés.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        saleIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Liste des IDs de ventes à synchroniser',
          example: ['uuid-1', 'uuid-2', 'uuid-3']
        }
      },
      required: ['saleIds']
    }
  })
  @ApiResponse({ status: 200, description: 'Ventes synchronisées avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  async batchSyncSales(@Body() body: { saleIds: string[] }) {
    await this.syncService.batchSyncSales(body.saleIds);
    return {
      message: `${body.saleIds.length} vente(s) synchronisée(s) avec succès`,
    };
  }

  @Post('clear-queue')
  @ApiOperation({
    summary: 'Vider la file de synchronisation',
    description: 'Supprime tous les éléments de la file de synchronisation.'
  })
  @ApiResponse({ status: 200, description: 'File de synchronisation vidée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  clearQueue() {
    this.syncService.clearQueue();
    return {
      message: 'File de synchronisation vidée avec succès',
    };
  }
}
