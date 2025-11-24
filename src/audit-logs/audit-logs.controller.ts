import { Controller, Get, Delete, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuditLogsService, AuditLogFilters } from './audit-logs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all audit logs with optional filters' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action type' })
  @ApiQuery({ name: 'module', required: false, description: 'Filter by module' })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by date (YYYY-MM-DD)' })
  async findAll(@Query() filters: AuditLogFilters) {
    return this.auditLogsService.findAll(filters);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get a specific audit log by ID' })
  async findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(+id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete an audit log (Super Admin only)' })
  async remove(@Param('id') id: string, @Request() req) {
    // Log the deletion action
    await this.auditLogsService.logAction(
      req.user.userId,
      req.user.username,
      req.user.role,
      'delete',
      'Audit',
      `Suppression log d'audit #${id}`,
      { deletedLogId: +id },
      req,
    );

    await this.auditLogsService.remove(+id);
    return { message: 'Audit log deleted successfully' };
  }
}
