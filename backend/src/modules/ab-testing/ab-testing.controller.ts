import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ABTestingService } from './ab-testing.service';
import type {
  CreateABTestDto,
  UpdateABTestDto,
  AssignVariantDto,
  TrackConversionDto,
} from './ab-testing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetTenant } from '../../common/decorators/get-tenant.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Permissions } from '../rbac/decorators/permissions.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TestStatus, WinnerSelectionMethod } from './ab-test.entity';

@ApiTags('A/B Testing')
@ApiBearerAuth()
@Controller('ab-tests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ABTestingController {
  constructor(private readonly abTestingService: ABTestingService) {}

  /**
   * Create new A/B test
   */
  @Post()
  @Permissions('ab_tests:create')
  @ApiOperation({ summary: 'Create new A/B test' })
  @ApiResponse({ status: 201, description: 'A/B test created' })
  async create(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Body() dto: CreateABTestDto,
  ) {
    const test = await this.abTestingService.create(tenantId, userId, dto);

    return {
      success: true,
      data: test,
      message: 'A/B test created successfully',
    };
  }

  /**
   * Get all A/B tests
   */
  @Get()
  @Permissions('ab_tests:read')
  @ApiOperation({ summary: 'Get all A/B tests' })
  @ApiResponse({ status: 200, description: 'List of A/B tests' })
  async findAll(
    @GetTenant() tenantId: string,
    @Query('status') status?: TestStatus,
  ) {
    const tests = await this.abTestingService.findAll(tenantId, status);

    return {
      success: true,
      data: tests,
      count: tests.length,
    };
  }

  /**
   * Get A/B test by ID
   */
  @Get(':id')
  @Permissions('ab_tests:read')
  @ApiOperation({ summary: 'Get A/B test by ID' })
  @ApiResponse({ status: 200, description: 'A/B test details' })
  async findOne(@GetTenant() tenantId: string, @Param('id') id: string) {
    const test = await this.abTestingService.findOne(tenantId, id);

    return {
      success: true,
      data: test,
    };
  }

  /**
   * Start A/B test
   */
  @Post(':id/start')
  @Permissions('ab_tests:update')
  @ApiOperation({ summary: 'Start A/B test' })
  @ApiResponse({ status: 200, description: 'A/B test started' })
  async start(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
  ) {
    const test = await this.abTestingService.start(tenantId, userId, id);

    return {
      success: true,
      data: test,
      message: 'A/B test started successfully',
    };
  }

  /**
   * Pause A/B test
   */
  @Post(':id/pause')
  @Permissions('ab_tests:update')
  @ApiOperation({ summary: 'Pause A/B test' })
  @ApiResponse({ status: 200, description: 'A/B test paused' })
  async pause(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
  ) {
    const test = await this.abTestingService.pause(tenantId, userId, id);

    return {
      success: true,
      data: test,
      message: 'A/B test paused successfully',
    };
  }

  /**
   * Complete A/B test
   */
  @Post(':id/complete')
  @Permissions('ab_tests:update')
  @ApiOperation({ summary: 'Complete A/B test' })
  @ApiResponse({ status: 200, description: 'A/B test completed' })
  async complete(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
  ) {
    const test = await this.abTestingService.complete(tenantId, userId, id);

    return {
      success: true,
      data: test,
      message: 'A/B test completed successfully',
    };
  }

  /**
   * Assign user to variant
   */
  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign user to variant' })
  @ApiResponse({ status: 200, description: 'User assigned to variant' })
  async assignVariant(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: AssignVariantDto,
  ) {
    const assignment = await this.abTestingService.assignVariant(tenantId, id, dto);

    return {
      success: true,
      data: assignment,
    };
  }

  /**
   * Track conversion
   */
  @Post(':id/convert')
  @ApiOperation({ summary: 'Track conversion' })
  @ApiResponse({ status: 200, description: 'Conversion tracked' })
  async trackConversion(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { sessionId: string } & TrackConversionDto,
  ) {
    await this.abTestingService.trackConversion(
      tenantId,
      id,
      body.sessionId,
      {
        value: body.value,
        metadata: body.metadata,
      },
    );

    return {
      success: true,
      message: 'Conversion tracked successfully',
    };
  }

  /**
   * Track event
   */
  @Post(':id/event')
  @ApiOperation({ summary: 'Track event' })
  @ApiResponse({ status: 200, description: 'Event tracked' })
  async trackEvent(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { sessionId: string; eventType: string; data?: Record<string, any> },
  ) {
    await this.abTestingService.trackEvent(
      tenantId,
      id,
      body.sessionId,
      body.eventType,
      body.data,
    );

    return {
      success: true,
      message: 'Event tracked successfully',
    };
  }

  /**
   * Select winner
   */
  @Post(':id/select-winner')
  @Permissions('ab_tests:update')
  @ApiOperation({ summary: 'Select winner' })
  @ApiResponse({ status: 200, description: 'Winner selected' })
  async selectWinner(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
    @Body() body: { method: WinnerSelectionMethod },
  ) {
    const test = await this.abTestingService.selectWinner(
      tenantId,
      userId,
      id,
      body.method,
    );

    return {
      success: true,
      data: test,
      message: 'Winner selected successfully',
    };
  }

  /**
   * Get test statistics
   */
  @Get(':id/statistics')
  @Permissions('ab_tests:read')
  @ApiOperation({ summary: 'Get test statistics' })
  @ApiResponse({ status: 200, description: 'Test statistics' })
  async getStatistics(@GetTenant() tenantId: string, @Param('id') id: string) {
    const stats = await this.abTestingService.getStatistics(tenantId, id);

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Calculate results
   */
  @Get(':id/results')
  @Permissions('ab_tests:read')
  @ApiOperation({ summary: 'Calculate test results' })
  @ApiResponse({ status: 200, description: 'Test results' })
  async calculateResults(@GetTenant() tenantId: string, @Param('id') id: string) {
    const results = await this.abTestingService.calculateResults(tenantId, id);

    return {
      success: true,
      data: results,
    };
  }

  /**
   * Update A/B test
   */
  @Put(':id')
  @Permissions('ab_tests:update')
  @ApiOperation({ summary: 'Update A/B test' })
  @ApiResponse({ status: 200, description: 'A/B test updated' })
  async update(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateABTestDto,
  ) {
    const test = await this.abTestingService.update(tenantId, userId, id, dto);

    return {
      success: true,
      data: test,
      message: 'A/B test updated successfully',
    };
  }

  /**
   * Delete A/B test
   */
  @Delete(':id')
  @Permissions('ab_tests:delete')
  @ApiOperation({ summary: 'Delete A/B test' })
  @ApiResponse({ status: 200, description: 'A/B test deleted' })
  async delete(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
  ) {
    await this.abTestingService.delete(tenantId, userId, id);

    return {
      success: true,
      message: 'A/B test deleted successfully',
    };
  }
}
