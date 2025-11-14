import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { InventoriesService } from './inventories.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('Inventories')
@ApiBearerAuth('JWT-auth')
@Controller('inventories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'Créer un nouvel inventaire', description: 'Démarre une nouvelle session d\'inventaire avec tous les produits actifs.' })
  @ApiResponse({ status: 201, description: 'Inventaire créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN ou SELLER.' })
  create(@Body() createInventoryDto: CreateInventoryDto, @CurrentUser() user: any) {
    return this.inventoriesService.create(createInventoryDto, user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'Récupérer tous les inventaires', description: 'Récupère la liste de tous les inventaires. Les vendeurs voient uniquement leurs inventaires.' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrer par utilisateur (admin uniquement)' })
  @ApiResponse({ status: 200, description: 'Liste des inventaires récupérée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN ou SELLER.' })
  findAll(@CurrentUser() user: any, @Query('userId') userId?: string) {
    // Si l'utilisateur est un vendeur, filtrer uniquement ses inventaires
    const filterUserId = user.role === UserRole.ADMIN ? userId : user.id;
    return this.inventoriesService.findAll(filterUserId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'Récupérer un inventaire par ID', description: 'Récupère les détails d\'un inventaire spécifique avec tous ses articles.' })
  @ApiParam({ name: 'id', description: 'ID de l\'inventaire' })
  @ApiResponse({ status: 200, description: 'Inventaire trouvé.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN ou SELLER.' })
  @ApiResponse({ status: 404, description: 'Inventaire non trouvé.' })
  findOne(@Param('id') id: string) {
    return this.inventoriesService.findOne(id);
  }

  @Patch(':id/items/:itemId')
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'Mettre à jour un article d\'inventaire', description: 'Met à jour la quantité physique comptée pour un article.' })
  @ApiParam({ name: 'id', description: 'ID de l\'inventaire' })
  @ApiParam({ name: 'itemId', description: 'ID de l\'article' })
  @ApiResponse({ status: 200, description: 'Article mis à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides ou inventaire déjà finalisé.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN ou SELLER.' })
  @ApiResponse({ status: 404, description: 'Inventaire ou article non trouvé.' })
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateInventoryItemDto,
  ) {
    return this.inventoriesService.updateItem(id, itemId, updateDto);
  }

  @Patch(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'Finaliser un inventaire', description: 'Finalise l\'inventaire et applique les ajustements de stock.' })
  @ApiParam({ name: 'id', description: 'ID de l\'inventaire' })
  @ApiResponse({ status: 200, description: 'Inventaire finalisé avec succès.' })
  @ApiResponse({ status: 400, description: 'Inventaire déjà finalisé ou annulé.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN ou SELLER.' })
  @ApiResponse({ status: 404, description: 'Inventaire non trouvé.' })
  complete(@Param('id') id: string) {
    return this.inventoriesService.complete(id);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'Annuler un inventaire', description: 'Annule un inventaire en cours sans appliquer les ajustements.' })
  @ApiParam({ name: 'id', description: 'ID de l\'inventaire' })
  @ApiResponse({ status: 200, description: 'Inventaire annulé avec succès.' })
  @ApiResponse({ status: 400, description: 'Inventaire déjà finalisé ou annulé.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN ou SELLER.' })
  @ApiResponse({ status: 404, description: 'Inventaire non trouvé.' })
  cancel(@Param('id') id: string) {
    return this.inventoriesService.cancel(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Supprimer un inventaire', description: 'Supprime définitivement un inventaire et tous ses articles.' })
  @ApiParam({ name: 'id', description: 'ID de l\'inventaire' })
  @ApiResponse({ status: 200, description: 'Inventaire supprimé avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN.' })
  @ApiResponse({ status: 404, description: 'Inventaire non trouvé.' })
  delete(@Param('id') id: string) {
    return this.inventoriesService.delete(id);
  }
}
