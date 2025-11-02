import { Controller, Get, Query, Param, UseGuards, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { AuditService, AuditLogFilter } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetTenant } from '../../common/decorators/get-tenant.decorator';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditAction, AuditSeverity } from './audit-log.entity';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Get audit logs with filters
   */
  @Get()
  @RequirePermissions('settings:read') // Only admins can view audit logs
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({ status: 200, description: 'List of audit logs' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false, enum: AuditAction })
  @ApiQuery({ name: 'resource', required: false })
  @ApiQuery({ name: 'resourceId', required: false })
  @ApiQuery({ name: 'severity', required: false, enum: AuditSeverity })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'isSuccess', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async find(
    @GetTenant() tenantId: string,
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('resource') resource?: string,
    @Query('resourceId') resourceId?: string,
    @Query('severity') severity?: AuditSeverity,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('isSuccess') isSuccess?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const filter: AuditLogFilter = {
      userId,
      action,
      resource,
      resourceId,
      severity,
      isSuccess: isSuccess === 'true' ? true : isSuccess === 'false' ? false : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    if (startDate) {
      filter.startDate = new Date(startDate);
    }

    if (endDate) {
      filter.endDate = new Date(endDate);
    }

    const logs = await this.auditService.find(tenantId, filter);

    return {
      success: true,
      data: logs,
      total: logs.length,
    };
  }

  /**
   * Get recent audit logs
   */
  @Get('recent')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get recent audit logs' })
  @ApiResponse({ status: 200, description: 'Recent audit logs' })
  @ApiQuery({ name: 'limit', required: false })
  async getRecent(@GetTenant() tenantId: string, @Query('limit') limit?: string) {
    const logs = await this.auditService.getRecent(tenantId, limit ? parseInt(limit) : 100);

    return {
      success: true,
      data: logs,
      total: logs.length,
    };
  }

  /**
   * Get audit logs for specific resource
   */
  @Get('resource/:resource')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get audit logs for resource' })
  @ApiResponse({ status: 200, description: 'Audit logs for resource' })
  @ApiQuery({ name: 'resourceId', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findByResource(
    @GetTenant() tenantId: string,
    @Param('resource') resource: string,
    @Query('resourceId') resourceId?: string,
    @Query('limit') limit?: string,
  ) {
    const logs = await this.auditService.findByResource(
      tenantId,
      resource,
      resourceId,
      limit ? parseInt(limit) : 50,
    );

    return {
      success: true,
      data: logs,
      total: logs.length,
    };
  }

  /**
   * Get audit logs for specific user
   */
  @Get('user/:userId')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get audit logs for user' })
  @ApiResponse({ status: 200, description: 'Audit logs for user' })
  @ApiQuery({ name: 'limit', required: false })
  async findByUser(
    @GetTenant() tenantId: string,
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    const logs = await this.auditService.findByUser(
      tenantId,
      userId,
      limit ? parseInt(limit) : 50,
    );

    return {
      success: true,
      data: logs,
      total: logs.length,
    };
  }

  /**
   * Get audit statistics
   */
  @Get('stats')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get audit statistics' })
  @ApiResponse({ status: 200, description: 'Audit statistics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getStats(
    @GetTenant() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const stats = await this.auditService.getStats(
      tenantId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get sensitive actions
   */
  @Get('sensitive')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get sensitive audit actions' })
  @ApiResponse({ status: 200, description: 'Sensitive audit actions' })
  @ApiQuery({ name: 'limit', required: false })
  async getSensitiveActions(@GetTenant() tenantId: string, @Query('limit') limit?: string) {
    const logs = await this.auditService.getSensitiveActions(
      tenantId,
      limit ? parseInt(limit) : 50,
    );

    return {
      success: true,
      data: logs,
      total: logs.length,
    };
  }

  /**
   * Export audit logs
   */
  @Get('export')
  @RequirePermissions('analytics:export')
  @ApiOperation({ summary: 'Export audit logs' })
  @ApiResponse({ status: 200, description: 'Exported audit logs' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async export(
    @GetTenant() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filter: AuditLogFilter = {};

    if (startDate) {
      filter.startDate = new Date(startDate);
    }

    if (endDate) {
      filter.endDate = new Date(endDate);
    }

    const data = await this.auditService.export(tenantId, filter);

    return {
      success: true,
      data,
      total: data.length,
    };
  }

  /**
   * Cleanup old audit logs
   */
  @Delete('cleanup')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Cleanup old audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs cleaned up' })
  @ApiQuery({ name: 'days', required: false })
  async cleanup(@GetTenant() tenantId: string, @Query('days') days?: string) {
    const daysToKeep = days ? parseInt(days) : 90;
    const deleted = await this.auditService.cleanup(tenantId, daysToKeep);

    return {
      success: true,
      message: `Deleted ${deleted} audit logs older than ${daysToKeep} days`,
      deleted,
    };
  }
}
