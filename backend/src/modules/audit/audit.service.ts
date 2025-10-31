import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { AuditLog, AuditAction, AuditSeverity } from './audit-log.entity';
import { CacheService } from '../../common/cache/cache.service';

export interface CreateAuditLogDto {
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  description?: string;
  severity?: AuditSeverity;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;
  method?: string;
  endpoint?: string;
  statusCode?: number;
  durationMs?: number;
  isSuccess?: boolean;
  errorMessage?: string;
  stackTrace?: string;
  impersonatorId?: string;
}

export interface AuditLogFilter {
  userId?: string;
  action?: AuditAction;
  resource?: string;
  resourceId?: string;
  severity?: AuditSeverity;
  startDate?: Date;
  endDate?: Date;
  isSuccess?: boolean;
  limit?: number;
  offset?: number;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Log an action
   */
  async log(tenantId: string, dto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...dto,
      tenantId,
      isSuccess: dto.isSuccess ?? true,
      severity: dto.severity ?? AuditSeverity.INFO,
    });

    const saved = await this.auditLogRepository.save(auditLog);

    // If it's a sensitive action, invalidate related caches
    if (saved.isSensitive()) {
      await this.invalidateRelatedCaches(tenantId, saved.resource, saved.resourceId);
    }

    return saved;
  }

  /**
   * Log a create action
   */
  async logCreate(
    tenantId: string,
    userId: string,
    resource: string,
    resourceId: string,
    metadata?: Record<string, any>,
  ): Promise<AuditLog> {
    return this.log(tenantId, {
      userId,
      action: AuditAction.CREATE,
      resource,
      resourceId,
      description: `Created ${resource} ${resourceId}`,
      metadata,
    });
  }

  /**
   * Log an update action
   */
  async logUpdate(
    tenantId: string,
    userId: string,
    resource: string,
    resourceId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
  ): Promise<AuditLog> {
    const changes = this.calculateChanges(oldValues, newValues);

    return this.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource,
      resourceId,
      description: `Updated ${resource} ${resourceId}`,
      metadata: {
        oldValues,
        newValues,
        changes,
      },
    });
  }

  /**
   * Log a delete action
   */
  async logDelete(
    tenantId: string,
    userId: string,
    resource: string,
    resourceId: string,
    metadata?: Record<string, any>,
  ): Promise<AuditLog> {
    return this.log(tenantId, {
      userId,
      action: AuditAction.DELETE,
      resource,
      resourceId,
      description: `Deleted ${resource} ${resourceId}`,
      severity: AuditSeverity.WARNING,
      metadata,
    });
  }

  /**
   * Log an error
   */
  async logError(
    tenantId: string,
    userId: string,
    action: AuditAction,
    resource: string,
    errorMessage: string,
    stackTrace?: string,
  ): Promise<AuditLog> {
    return this.log(tenantId, {
      userId,
      action,
      resource,
      description: `Error during ${action} on ${resource}`,
      severity: AuditSeverity.ERROR,
      isSuccess: false,
      errorMessage,
      stackTrace,
    });
  }

  /**
   * Find audit logs with filters
   */
  async find(tenantId: string, filter: AuditLogFilter = {}): Promise<AuditLog[]> {
    const query = this.auditLogRepository
      .createQueryBuilder('log')
      .where('log.tenantId = :tenantId', { tenantId });

    if (filter.userId) {
      query.andWhere('log.userId = :userId', { userId: filter.userId });
    }

    if (filter.action) {
      query.andWhere('log.action = :action', { action: filter.action });
    }

    if (filter.resource) {
      query.andWhere('log.resource = :resource', { resource: filter.resource });
    }

    if (filter.resourceId) {
      query.andWhere('log.resourceId = :resourceId', { resourceId: filter.resourceId });
    }

    if (filter.severity) {
      query.andWhere('log.severity = :severity', { severity: filter.severity });
    }

    if (filter.isSuccess !== undefined) {
      query.andWhere('log.isSuccess = :isSuccess', { isSuccess: filter.isSuccess });
    }

    if (filter.startDate && filter.endDate) {
      query.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filter.startDate,
        endDate: filter.endDate,
      });
    } else if (filter.startDate) {
      query.andWhere('log.createdAt >= :startDate', { startDate: filter.startDate });
    } else if (filter.endDate) {
      query.andWhere('log.createdAt <= :endDate', { endDate: filter.endDate });
    }

    query.orderBy('log.createdAt', 'DESC');

    if (filter.limit) {
      query.take(filter.limit);
    }

    if (filter.offset) {
      query.skip(filter.offset);
    }

    return await query.getMany();
  }

  /**
   * Get audit logs for a specific resource
   */
  async findByResource(
    tenantId: string,
    resource: string,
    resourceId?: string,
    limit = 50,
  ): Promise<AuditLog[]> {
    return this.find(tenantId, {
      resource,
      resourceId,
      limit,
    });
  }

  /**
   * Get audit logs for a specific user
   */
  async findByUser(tenantId: string, userId: string, limit = 50): Promise<AuditLog[]> {
    return this.find(tenantId, {
      userId,
      limit,
    });
  }

  /**
   * Get recent audit logs
   */
  async getRecent(tenantId: string, limit = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get audit statistics
   */
  async getStats(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalLogs: number;
    byAction: Record<string, number>;
    bySeverity: Record<string, number>;
    byResource: Record<string, number>;
    successRate: number;
    errorCount: number;
  }> {
    const query = this.auditLogRepository
      .createQueryBuilder('log')
      .where('log.tenantId = :tenantId', { tenantId });

    if (startDate && endDate) {
      query.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const logs = await query.getMany();

    const stats = {
      totalLogs: logs.length,
      byAction: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      byResource: {} as Record<string, number>,
      successRate: 0,
      errorCount: 0,
    };

    let successCount = 0;

    for (const log of logs) {
      // Count by action
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;

      // Count by severity
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;

      // Count by resource
      stats.byResource[log.resource] = (stats.byResource[log.resource] || 0) + 1;

      // Count success
      if (log.isSuccess) {
        successCount++;
      }

      // Count errors
      if (!log.isSuccess || log.severity === AuditSeverity.ERROR) {
        stats.errorCount++;
      }
    }

    stats.successRate = logs.length > 0 ? (successCount / logs.length) * 100 : 0;

    return stats;
  }

  /**
   * Get sensitive actions (for security monitoring)
   */
  async getSensitiveActions(tenantId: string, limit = 50): Promise<AuditLog[]> {
    const logs = await this.getRecent(tenantId, limit * 2);
    return logs.filter((log) => log.isSensitive()).slice(0, limit);
  }

  /**
   * Clean up old audit logs
   */
  async cleanup(tenantId: string, daysToKeep = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('tenantId = :tenantId', { tenantId })
      .andWhere('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * Export audit logs
   */
  async export(
    tenantId: string,
    filter: AuditLogFilter = {},
  ): Promise<Array<Record<string, any>>> {
    const logs = await this.find(tenantId, filter);

    return logs.map((log) => ({
      id: log.id,
      timestamp: log.createdAt,
      user: log.userId,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      description: log.description,
      severity: log.severity,
      success: log.isSuccess,
      ipAddress: log.ipAddress,
      method: log.method,
      endpoint: log.endpoint,
      statusCode: log.statusCode,
      errorMessage: log.errorMessage,
    }));
  }

  /**
   * Calculate changes between old and new values
   */
  private calculateChanges(
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
  ): Array<{ field: string; from: any; to: any }> {
    if (!oldValues || !newValues) {
      return [];
    }

    const changes: Array<{ field: string; from: any; to: any }> = [];

    for (const key of Object.keys(newValues)) {
      if (oldValues[key] !== newValues[key]) {
        changes.push({
          field: key,
          from: oldValues[key],
          to: newValues[key],
        });
      }
    }

    return changes;
  }

  /**
   * Invalidate related caches after sensitive actions
   */
  private async invalidateRelatedCaches(
    tenantId: string,
    resource: string,
    resourceId?: string,
  ): Promise<void> {
    // Invalidate by tags
    await this.cacheService.invalidateByTag(`tenant:${tenantId}`);
    await this.cacheService.invalidateByTag(`${resource}:all`);

    if (resourceId) {
      await this.cacheService.invalidateByTag(`${resource}:${resourceId}`);
    }
  }
}
