import { Controller, Get, Post, Body, Param, UseGuards, Patch, Delete, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeletionRequestsService } from './deletion-requests.service';
import { CreateDeletionRequestDto } from './dto/create-deletion-request.dto';
import { UpdateDeletionRequestDto } from './dto/update-deletion-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Deletion Requests')
@ApiBearerAuth('JWT-auth')
@Controller('deletion-requests')
@UseGuards(JwtAuthGuard)
export class DeletionRequestsController {
  constructor(private readonly deletionRequestsService: DeletionRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une demande de suppression de vente' })
  @ApiResponse({ status: 201, description: 'Demande créée avec succès.' })
  @ApiResponse({ status: 400, description: 'Demande déjà existante ou données invalides.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  async create(@Body() createDto: CreateDeletionRequestDto, @CurrentUser() user: any) {
    return await this.deletionRequestsService.create(createDto, user.id, user.fullName || user.username);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les demandes' })
  @ApiResponse({ status: 200, description: 'Liste des demandes récupérée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  async findAll(@CurrentUser() user: any) {
    // Si super admin, retourner toutes les demandes
    if (user.isSuperAdmin) {
      return await this.deletionRequestsService.findAll();
    }

    // Sinon, retourner uniquement les demandes du vendeur
    return await this.deletionRequestsService.findBySeller(user.id);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Récupérer les demandes en attente (super admin uniquement)' })
  @ApiResponse({ status: 200, description: 'Liste des demandes en attente.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  async findPending(@CurrentUser() user: any) {
    if (!user.isSuperAdmin) {
      throw new ForbiddenException('Accès réservé au super administrateur');
    }
    return await this.deletionRequestsService.findPending();
  }

  @Get('sale/:saleId')
  @ApiOperation({ summary: 'Vérifier si une vente a une demande en attente' })
  @ApiResponse({ status: 200, description: 'Retourne la demande si elle existe.' })
  async getPendingRequestForSale(@Param('saleId') saleId: string) {
    const hasPending = await this.deletionRequestsService.hasPendingRequest(saleId);
    if (!hasPending) {
      return { hasPendingRequest: false, request: null };
    }

    const request = await this.deletionRequestsService.getPendingRequestForSale(saleId);
    return { hasPendingRequest: true, request };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une demande par ID' })
  @ApiResponse({ status: 200, description: 'Demande récupérée avec succès.' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée.' })
  async findOne(@Param('id') id: string) {
    return await this.deletionRequestsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une demande (vendeur, < 5 min)' })
  @ApiResponse({ status: 200, description: 'Demande mise à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Délai dépassé ou demande déjà traitée.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  async update(
    @Param('id') id: string,
    @Body() body: { reasons: string[]; description: string },
    @CurrentUser() user: any,
  ) {
    return await this.deletionRequestsService.update(id, body.reasons, body.description, user.id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approuver une demande (super admin uniquement)' })
  @ApiResponse({ status: 200, description: 'Demande approuvée et vente supprimée.' })
  @ApiResponse({ status: 400, description: 'Demande déjà traitée.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  async approve(
    @Param('id') id: string,
    @Body() body: { adminResponse?: string },
    @CurrentUser() user: any,
  ) {
    if (!user.isSuperAdmin) {
      throw new ForbiddenException('Accès réservé au super administrateur');
    }
    return await this.deletionRequestsService.approve(id, body.adminResponse);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Rejeter une demande (super admin uniquement)' })
  @ApiResponse({ status: 200, description: 'Demande rejetée.' })
  @ApiResponse({ status: 400, description: 'Raison de rejet obligatoire ou demande déjà traitée.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  async reject(
    @Param('id') id: string,
    @Body() body: { adminResponse: string },
    @CurrentUser() user: any,
  ) {
    if (!user.isSuperAdmin) {
      throw new ForbiddenException('Accès réservé au super administrateur');
    }
    return await this.deletionRequestsService.reject(id, body.adminResponse);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une demande' })
  @ApiResponse({ status: 200, description: 'Demande supprimée.' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée.' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    if (!user.isSuperAdmin) {
      throw new ForbiddenException('Accès réservé au super administrateur');
    }
    await this.deletionRequestsService.remove(id);
    return { message: 'Demande supprimée avec succès' };
  }
}
