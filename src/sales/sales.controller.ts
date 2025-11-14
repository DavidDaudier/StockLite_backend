import { Controller, Get, Post, Body, Param, Query, UseGuards, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Sales')
@ApiBearerAuth('JWT-auth')
@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle vente', description: 'Enregistre une nouvelle vente et met à jour le stock des produits.' })
  @ApiResponse({ status: 201, description: 'Vente créée avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides ou stock insuffisant.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  create(@Body() createSaleDto: CreateSaleDto, @CurrentUser() user: any) {
    return this.salesService.create(createSaleDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les ventes', description: 'Récupère la liste des ventes avec filtres optionnels. Les vendeurs voient uniquement leurs ventes.' })
  @ApiQuery({ name: 'sellerId', required: false, description: 'Filtrer par vendeur (admin uniquement)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Date de début (ISO 8601)', example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Date de fin (ISO 8601)', example: '2025-12-31' })
  @ApiResponse({ status: 200, description: 'Liste des ventes récupérée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  findAll(
    @CurrentUser() user: any,
    @Query('sellerId') sellerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    let queryStartDate: Date | undefined = undefined;
    let queryEndDate: Date | undefined = undefined;

    if (startDate) {
      // Support both ISO format (2025-11-06T05:00:00.000Z) and simple format (2025-11-06)
      queryStartDate = new Date(startDate);
      // Si la date est au format simple, définir l'heure au début de la journée
      if (!startDate.includes('T')) {
        queryStartDate.setHours(0, 0, 0, 0);
      }
    }

    if (endDate) {
      // Support both ISO format and simple format
      queryEndDate = new Date(endDate);
      // Si la date est au format simple, définir l'heure à la fin de la journée
      if (!endDate.includes('T')) {
        queryEndDate.setHours(23, 59, 59, 999);
      }
    }

    const searchSellerId = user.role === 'admin' ? sellerId : user.id;

    return this.salesService.findAll(searchSellerId, queryStartDate, queryEndDate);
  }

  @Get('today')
  @ApiOperation({ summary: 'Récupérer les ventes du jour', description: 'Récupère toutes les ventes effectuées aujourd\'hui.' })
  @ApiResponse({ status: 200, description: 'Ventes du jour récupérées avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  getTodaySales(@CurrentUser() user: any) {
    const sellerId = user.role === 'admin' ? undefined : user.id;
    return this.salesService.getTodaySales(sellerId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Récupérer les statistiques de ventes', description: 'Récupère les statistiques agrégées des ventes (total, nombre, etc.).' })
  @ApiQuery({ name: 'sellerId', required: false, description: 'Filtrer par vendeur (admin uniquement)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Date de début (ISO 8601)', example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Date de fin (ISO 8601)', example: '2025-12-31' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  getStats(
    @CurrentUser() user: any,
    @Query('sellerId') sellerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    let queryStartDate: Date | undefined = undefined;
    let queryEndDate: Date | undefined = undefined;

    if (startDate) {
      // Support both ISO format (2025-11-06T05:00:00.000Z) and simple format (2025-11-06)
      queryStartDate = new Date(startDate);
      // Si la date est au format simple, définir l'heure au début de la journée
      if (!startDate.includes('T')) {
        queryStartDate.setHours(0, 0, 0, 0);
      }
    }

    if (endDate) {
      // Support both ISO format and simple format
      queryEndDate = new Date(endDate);
      // Si la date est au format simple, définir l'heure à la fin de la journée
      if (!endDate.includes('T')) {
        queryEndDate.setHours(23, 59, 59, 999);
      }
    }

    const searchSellerId = user.role === 'admin' ? sellerId : user.id;

    return this.salesService.getSalesStats(searchSellerId, queryStartDate, queryEndDate);
  }

  @Get('drafts')
  @ApiOperation({ summary: 'Récupérer les brouillons', description: 'Récupère toutes les ventes en brouillon du vendeur.' })
  @ApiResponse({ status: 200, description: 'Brouillons récupérés avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  getDrafts(@CurrentUser() user: any) {
    return this.salesService.getDrafts(user.id);
  }

  @Post('draft')
  @ApiOperation({ summary: 'Créer un brouillon', description: 'Sauvegarde une vente en brouillon sans finaliser la transaction.' })
  @ApiResponse({ status: 201, description: 'Brouillon créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  createDraft(@Body() createSaleDto: CreateSaleDto, @CurrentUser() user: any) {
    return this.salesService.createDraft(createSaleDto, user.id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Finaliser un brouillon', description: 'Transforme un brouillon en vente complète et met à jour le stock.' })
  @ApiParam({ name: 'id', description: 'ID du brouillon' })
  @ApiResponse({ status: 200, description: 'Brouillon finalisé avec succès.' })
  @ApiResponse({ status: 404, description: 'Brouillon non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  completeDraft(@Param('id') id: string) {
    return this.salesService.completeDraft(id);
  }

  @Delete('draft/:id')
  @ApiOperation({ summary: 'Supprimer un brouillon', description: 'Supprime définitivement un brouillon.' })
  @ApiParam({ name: 'id', description: 'ID du brouillon' })
  @ApiResponse({ status: 200, description: 'Brouillon supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Brouillon non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  deleteDraft(@Param('id') id: string) {
    return this.salesService.deleteDraft(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une vente', description: 'Supprime définitivement une vente et restaure le stock si elle était complétée.' })
  @ApiParam({ name: 'id', description: 'ID de la vente' })
  @ApiResponse({ status: 200, description: 'Vente supprimée avec succès.' })
  @ApiResponse({ status: 404, description: 'Vente non trouvée.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  deleteSale(@Param('id') id: string) {
    return this.salesService.delete(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une vente par ID', description: 'Récupère les détails d\'une vente spécifique avec ses articles.' })
  @ApiParam({ name: 'id', description: 'ID de la vente' })
  @ApiResponse({ status: 200, description: 'Vente trouvée.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 404, description: 'Vente non trouvée.' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Synchroniser les ventes', description: 'Marque les ventes comme synchronisées après leur envoi au serveur.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        saleIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Liste des IDs de ventes à synchroniser',
          example: ['uuid-1', 'uuid-2']
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Ventes synchronisées avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  async syncSales(@Body() body: { saleIds: string[] }) {
    await this.salesService.markAsSynced(body.saleIds);
    return { message: 'Ventes synchronisées avec succès' };
  }
}
