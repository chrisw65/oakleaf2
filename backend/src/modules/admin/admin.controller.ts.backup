import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get dashboard statistics
   */
  @Get('dashboard/stats')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  async getDashboardStats() {
    const stats = await this.adminService.getDashboardStats();

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get system health
   */
  @Get('system/health')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System health information' })
  async getSystemHealth() {
    const health = await this.adminService.getSystemHealth();

    return {
      success: true,
      data: health,
    };
  }

  /**
   * Get all tenants with analytics
   */
  @Get('tenants')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get all tenants with analytics' })
  @ApiResponse({ status: 200, description: 'List of tenants with analytics' })
  async getAllTenants(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    const tenants = await this.adminService.getAllTenantsAnalytics(
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );

    return {
      success: true,
      data: tenants,
      total: tenants.length,
    };
  }

  /**
   * Get tenant analytics
   */
  @Get('tenants/:tenantId/analytics')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get tenant analytics' })
  @ApiResponse({ status: 200, description: 'Tenant analytics' })
  async getTenantAnalytics(@Param('tenantId') tenantId: string) {
    const analytics = await this.adminService.getTenantAnalytics(tenantId);

    return {
      success: true,
      data: analytics,
    };
  }

  /**
   * Get revenue analytics
   */
  @Get('analytics/revenue')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiResponse({ status: 200, description: 'Revenue analytics' })
  async getRevenueAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const analytics = await this.adminService.getRevenueAnalytics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    return {
      success: true,
      data: analytics,
    };
  }

  /**
   * Get user growth analytics
   */
  @Get('analytics/users/growth')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get user growth analytics' })
  @ApiResponse({ status: 200, description: 'User growth analytics' })
  async getUserGrowthAnalytics(@Query('days') days?: string) {
    const analytics = await this.adminService.getUserGrowthAnalytics(
      days ? parseInt(days) : 30,
    );

    return {
      success: true,
      data: analytics,
    };
  }
}
