import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({
    summary: 'Rapport des ventes journalières',
    description: 'Récupère le rapport détaillé des ventes pour une journée spécifique. Accessible aux ADMIN et SELLER.'
  })
  @ApiQuery({ name: 'date', required: false, description: 'Date du rapport (ISO 8601)', example: '2025-01-15' })
  @ApiResponse({ status: 200, description: 'Rapport journalier récupéré avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN ou SELLER.' })
  getDailyReport(@Query('date') date?: string) {
    let targetDate: Date | undefined = undefined;
    if (date) {
      const [year, month, day] = date.split('-').map(Number);
      targetDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    return this.reportsService.getDailySalesReport(targetDate);
  }

  @Get('weekly')
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({
    summary: 'Rapport des ventes hebdomadaires',
    description: 'Récupère le rapport des ventes pour une semaine. Accessible aux ADMIN et SELLER.'
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Date de début de la semaine (ISO 8601)', example: '2025-01-13' })
  @ApiResponse({ status: 200, description: 'Rapport hebdomadaire récupéré avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN ou SELLER.' })
  getWeeklyReport(@Query('startDate') startDate?: string) {
    let date: Date | undefined = undefined;
    if (startDate) {
      const [year, month, day] = startDate.split('-').map(Number);
      date = new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    return this.reportsService.getWeeklySalesReport(date);
  }

  @Get('monthly')
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({
    summary: 'Rapport des ventes mensuelles',
    description: 'Récupère le rapport des ventes pour un mois spécifique. Accessible aux ADMIN et SELLER.'
  })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Année du rapport', example: 2025 })
  @ApiQuery({ name: 'month', required: false, type: Number, description: 'Mois du rapport (0-11)', example: 0 })
  @ApiResponse({ status: 200, description: 'Rapport mensuel récupéré avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN ou SELLER.' })
  getMonthlyReport(
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
    @Query('month', new ParseIntPipe({ optional: true })) month?: number,
  ) {
    return this.reportsService.getMonthlySalesReport(year, month);
  }

  @Get('top-products')
  @ApiOperation({
    summary: 'Top produits vendus',
    description: 'Récupère les produits les plus vendus pour une période donnée. Si aucune date n\'est fournie, utilise les 30 derniers jours. Nécessite le rôle ADMIN.'
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Date de début (ISO 8601)', example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Date de fin (ISO 8601)', example: '2025-01-31' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre de produits à retourner', example: 10 })
  @ApiResponse({ status: 200, description: 'Top produits récupérés avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN.' })
  getTopProducts(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    // Si pas de dates fournies, utiliser les 30 derniers jours
    let end: Date;
    let start: Date;

    if (endDate) {
      const [year, month, day] = endDate.split('-').map(Number);
      end = new Date(year, month - 1, day, 23, 59, 59, 999);
    } else {
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }

    if (startDate) {
      const [year, month, day] = startDate.split('-').map(Number);
      start = new Date(year, month - 1, day, 0, 0, 0, 0);
    } else {
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
    }

    return this.reportsService.getTopSellingProducts(start, end, limit);
  }

  @Get('top-sellers')
  @ApiOperation({
    summary: 'Top vendeurs',
    description: 'Récupère les meilleurs vendeurs pour une période donnée. Si aucune date n\'est fournie, utilise les 30 derniers jours. Nécessite le rôle ADMIN.'
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Date de début (ISO 8601)', example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Date de fin (ISO 8601)', example: '2025-01-31' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre de vendeurs à retourner', example: 10 })
  @ApiResponse({ status: 200, description: 'Top vendeurs récupérés avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN.' })
  getTopSellers(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    // Si pas de dates fournies, utiliser les 30 derniers jours
    let end: Date;
    let start: Date;

    if (endDate) {
      const [year, month, day] = endDate.split('-').map(Number);
      end = new Date(year, month - 1, day, 23, 59, 59, 999);
    } else {
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }

    if (startDate) {
      const [year, month, day] = startDate.split('-').map(Number);
      start = new Date(year, month - 1, day, 0, 0, 0, 0);
    } else {
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
    }

    return this.reportsService.getTopSellers(start, end, limit);
  }

  @Get('inventory')
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({
    summary: 'Rapport d\'inventaire',
    description: 'Récupère le rapport complet de l\'inventaire actuel. Accessible aux ADMIN et SELLER.'
  })
  @ApiResponse({ status: 200, description: 'Rapport d\'inventaire récupéré avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN ou SELLER.' })
  getInventoryReport() {
    return this.reportsService.getInventoryReport();
  }

  @Get('financial')
  @ApiOperation({
    summary: 'Rapport financier',
    description: 'Récupère le rapport financier détaillé pour une période donnée. Si aucune date n\'est fournie, utilise le mois en cours. Nécessite le rôle ADMIN.'
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Date de début (ISO 8601)', example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Date de fin (ISO 8601)', example: '2025-01-31' })
  @ApiResponse({ status: 200, description: 'Rapport financier récupéré avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Nécessite le rôle ADMIN.' })
  getFinancialReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Si pas de dates fournies, utiliser le mois en cours
    let end: Date;
    let start: Date;

    if (endDate) {
      // Parse endDate and set time to end of day (23:59:59.999)
      const [year, month, day] = endDate.split('-').map(Number);
      end = new Date(year, month - 1, day, 23, 59, 59, 999);
    } else {
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }

    if (startDate) {
      // Parse startDate and set time to start of day (00:00:00.000)
      const [year, month, day] = startDate.split('-').map(Number);
      start = new Date(year, month - 1, day, 0, 0, 0, 0);
    } else {
      start = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0, 0);
    }

    return this.reportsService.getFinancialReport(start, end);
  }
}
