import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('Categories')
@ApiBearerAuth('JWT-auth')
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer une nouvelle catégorie', description: 'Crée une nouvelle catégorie de produits. Nécessite le rôle ADMIN.' })
  @ApiResponse({ status: 201, description: 'Catégorie créée avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN.' })
  @ApiResponse({ status: 409, description: 'Une catégorie avec ce nom existe déjà.' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les catégories', description: 'Récupère la liste de toutes les catégories actives.' })
  @ApiResponse({ status: 200, description: 'Liste des catégories récupérée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Récupérer les statistiques des catégories', description: 'Récupère les statistiques pour toutes les catégories. Nécessite le rôle ADMIN.' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN.' })
  getStats() {
    return this.categoriesService.getCategoryStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une catégorie par ID', description: 'Récupère les détails d\'une catégorie spécifique.' })
  @ApiParam({ name: 'id', description: 'ID de la catégorie' })
  @ApiResponse({ status: 200, description: 'Catégorie trouvée.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée.' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour une catégorie', description: 'Met à jour les informations d\'une catégorie existante. Nécessite le rôle ADMIN.' })
  @ApiParam({ name: 'id', description: 'ID de la catégorie' })
  @ApiResponse({ status: 200, description: 'Catégorie mise à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN.' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée.' })
  @ApiResponse({ status: 409, description: 'Une catégorie avec ce nom existe déjà.' })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Supprimer une catégorie', description: 'Désactive une catégorie du système. Nécessite le rôle ADMIN.' })
  @ApiParam({ name: 'id', description: 'ID de la catégorie' })
  @ApiResponse({ status: 200, description: 'Catégorie supprimée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN.' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée.' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
