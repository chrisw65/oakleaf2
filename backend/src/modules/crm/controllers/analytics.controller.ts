import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AnalyticsService, DashboardMetrics, PipelineHealthReport, RepPerformanceReport } from '../services/analytics.service';

@ApiTags('CRM Analytics')
@Controller('crm/analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get CRM dashboard metrics' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by specific user (defaults to all)' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics retrieved successfully' })
  async getDashboardMetrics(
    @Query('userId') userId?: string,
    @CurrentUser() user?: any,
  ): Promise<DashboardMetrics> {
    return this.analyticsService.getDashboardMetrics(user.tenantId, userId);
  }

  @Get('pipeline-health/:pipelineId')
  @ApiOperation({ summary: 'Get pipeline health report' })
  @ApiParam({ name: 'pipelineId', description: 'Pipeline ID' })
  @ApiResponse({ status: 200, description: 'Pipeline health report retrieved successfully' })
  async getPipelineHealth(
    @Param('pipelineId') pipelineId: string,
    @CurrentUser() user?: any,
  ): Promise<PipelineHealthReport> {
    return this.analyticsService.getPipelineHealthReport(pipelineId, user.tenantId);
  }

  @Get('rep-performance')
  @ApiOperation({ summary: 'Get sales rep performance report' })
  @ApiResponse({ status: 200, description: 'Rep performance report retrieved successfully' })
  async getRepPerformance(
    @CurrentUser() user?: any,
  ): Promise<RepPerformanceReport[]> {
    return this.analyticsService.getRepPerformanceReport(user.tenantId);
  }
}
