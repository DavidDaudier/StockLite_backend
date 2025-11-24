import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog } from './audit-log.entity';

export interface CreateAuditLogDto {
  userId: string; // UUID
  username: string;
  role: string;
  action: string;
  module: string;
  subject?: string;
  browser?: string;
  details?: any;
  ipAddress?: string;
}

export interface AuditLogFilters {
  userId?: string;
  role?: string;
  action?: string;
  module?: string;
  date?: string;
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Create a new audit log entry
   */
  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(createAuditLogDto);
    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Find all audit logs with optional filters
   */
  async findAll(filters: AuditLogFilters = {}): Promise<AuditLog[]> {
    const query = this.auditLogRepository.createQueryBuilder('audit_log')
      .leftJoinAndSelect('audit_log.user', 'user')
      .orderBy('audit_log.timestamp', 'DESC');

    // Apply filters
    if (filters.userId) {
      query.andWhere('audit_log.userId = :userId', { userId: filters.userId });
    }

    if (filters.role) {
      query.andWhere('audit_log.role = :role', { role: filters.role });
    }

    if (filters.action) {
      query.andWhere('audit_log.action = :action', { action: filters.action });
    }

    if (filters.module) {
      query.andWhere('audit_log.module = :module', { module: filters.module });
    }

    if (filters.date) {
      // Filter by specific date (ignoring time)
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);

      query.andWhere('audit_log.timestamp BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      });
    }

    return query.getMany();
  }

  /**
   * Find one audit log by ID
   */
  async findOne(id: number): Promise<AuditLog> {
    return this.auditLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  /**
   * Delete an audit log (admin only)
   */
  async remove(id: number): Promise<void> {
    await this.auditLogRepository.delete(id);
  }

  /**
   * Helper method to log user actions automatically
   */
  async logAction(
    userId: string, // UUID
    username: string,
    role: string,
    action: string,
    module: string,
    subject?: string,
    details?: any,
    request?: any,
  ): Promise<AuditLog> {
    const browser = request?.headers?.['user-agent'] || 'Unknown';
    const ipAddress = request?.ip || request?.connection?.remoteAddress || 'Unknown';

    return this.create({
      userId,
      username,
      role,
      action,
      module,
      subject,
      browser,
      details,
      ipAddress,
    });
  }
}
