import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AnalyticsService, TrackEventDto } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetTenant } from '../auth/get-tenant.decorator';
import { Permissions } from '../rbac/permissions.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Track an analytics event
   */
  @Post('track')
  @Permissions('analytics:write')
  @ApiOperation({ summary: 'Track an analytics event' })
  @ApiResponse({ status: 201, description: 'Event tracked successfully' })
  async trackEvent(@GetTenant() tenantId: string, @Body() dto: TrackEventDto) {
    const event = await this.analyticsService.trackEvent(dto, tenantId);

    return {
      success: true,
      data: event,
      message: 'Event tracked successfully',
    };
  }

  /**
   * Get revenue analytics
   */
  @Get('revenue')
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['day', 'week', 'month'] })
  @ApiResponse({ status: 200, description: 'Revenue analytics data' })
  async getRevenueAnalytics(
    @GetTenant() tenantId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
    @Query('groupBy', new DefaultValuePipe('day')) groupBy: 'day' | 'week' | 'month',
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.analyticsService.getRevenueAnalytics(
      tenantId,
      startDate,
      endDate,
      groupBy,
    );

    return {
      success: true,
      data,
    };
  }

  /**
   * Get revenue by product
   */
  @Get('revenue/by-product')
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get revenue by product' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Revenue by product' })
  async getRevenueByProduct(
    @GetTenant() tenantId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.analyticsService.getRevenueByProduct(tenantId, startDate, endDate);

    return {
      success: true,
      data,
    };
  }

  /**
   * Get revenue by affiliate
   */
  @Get('revenue/by-affiliate')
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get revenue by affiliate' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Revenue by affiliate' })
  async getRevenueByAffiliate(
    @GetTenant() tenantId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.analyticsService.getRevenueByAffiliate(tenantId, startDate, endDate);

    return {
      success: true,
      data,
    };
  }

  /**
   * Get conversion funnel analysis
   */
  @Get('funnel/:funnelId')
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get conversion funnel analysis' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Conversion funnel data' })
  async getConversionFunnel(
    @GetTenant() tenantId: string,
    @Query('funnelId') funnelId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.analyticsService.getConversionFunnel(
      tenantId,
      funnelId,
      startDate,
      endDate,
    );

    return {
      success: true,
      data,
    };
  }

  /**
   * Get UTM campaign performance
   */
  @Get('utm-performance')
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get UTM campaign performance' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'UTM campaign performance data' })
  async getUTMPerformance(
    @GetTenant() tenantId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.analyticsService.getUTMPerformance(tenantId, startDate, endDate);

    return {
      success: true,
      data,
    };
  }

  /**
   * Get device analytics
   */
  @Get('devices')
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get device analytics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Device analytics data' })
  async getDeviceAnalytics(
    @GetTenant() tenantId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.analyticsService.getDeviceAnalytics(tenantId, startDate, endDate);

    return {
      success: true,
      data,
    };
  }

  /**
   * Get geo analytics
   */
  @Get('geo')
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get geo analytics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Geo analytics data' })
  async getGeoAnalytics(
    @GetTenant() tenantId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.analyticsService.getGeoAnalytics(tenantId, startDate, endDate);

    return {
      success: true,
      data,
    };
  }

  /**
   * Get cohort analysis
   */
  @Get('cohorts')
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get cohort analysis' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiQuery({ name: 'cohortSize', required: false, enum: ['week', 'month'] })
  @ApiResponse({ status: 200, description: 'Cohort analysis data' })
  async getCohortAnalysis(
    @GetTenant() tenantId: string,
    @Query('days', new DefaultValuePipe(90), ParseIntPipe) days: number,
    @Query('cohortSize', new DefaultValuePipe('month')) cohortSize: 'week' | 'month',
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.analyticsService.getCohortAnalysis(
      tenantId,
      startDate,
      endDate,
      cohortSize,
    );

    return {
      success: true,
      data,
    };
  }

  /**
   * Get real-time metrics
   */
  @Get('realtime')
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get real-time metrics (last 24 hours)' })
  @ApiResponse({ status: 200, description: 'Real-time metrics' })
  async getRealTimeMetrics(@GetTenant() tenantId: string) {
    const data = await this.analyticsService.getRealTimeMetrics(tenantId);

    return {
      success: true,
      data,
    };
  }

  /**
   * Get trend analysis
   */
  @Get('trends')
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get trend analysis' })
  @ApiQuery({ name: 'metric', required: true, enum: ['revenue', 'conversions', 'traffic'] })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Trend analysis data' })
  async getTrendAnalysis(
    @GetTenant() tenantId: string,
    @Query('metric') metric: 'revenue' | 'conversions' | 'traffic',
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const data = await this.analyticsService.getTrendAnalysis(tenantId, metric, days);

    return {
      success: true,
      data,
    };
  }

  /**
   * Get funnel analytics (existing method)
   */
  @Get('funnel/:funnelId/stats')
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get funnel statistics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Funnel statistics' })
  async getFunnelAnalytics(
    @GetTenant() tenantId: string,
    @Query('funnelId') funnelId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const data = await this.analyticsService.getFunnelAnalytics(funnelId, tenantId, days);

    return {
      success: true,
      data,
    };
  }

  /**
   * Get page analytics (existing method)
   */
  @Get('page/:pageId')
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get page analytics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Page analytics' })
  async getPageAnalytics(
    @GetTenant() tenantId: string,
    @Query('pageId') pageId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const data = await this.analyticsService.getPageAnalytics(pageId, tenantId, days);

    return {
      success: true,
      data,
    };
  }
}
