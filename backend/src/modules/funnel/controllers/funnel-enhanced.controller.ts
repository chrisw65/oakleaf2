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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../user/user.entity';
import { FunnelVariantService } from '../services/funnel-variant.service';
import { FunnelAnalyticsService } from '../services/funnel-analytics.service';
import { FunnelEnhancedService } from '../services/funnel-enhanced.service';
import {
  CreateFunnelVariantDto,
  UpdateFunnelVariantDto,
  DeclareWinnerDto,
} from '../dto/funnel-variant.dto';
import {
  FunnelAnalyticsQueryDto,
  FunnelInsightsDto,
} from '../dto/funnel-analytics.dto';
import {
  CreateFunnelGoalDto,
  UpdateFunnelGoalDto,
  CreateFunnelConditionDto,
  UpdateFunnelConditionDto,
  UpdateSuggestionStatusDto,
  TrackSessionDto,
  TrackEventDto,
} from '../dto/funnel-enhanced.dto';

@ApiTags('Funnel - Enhanced Features')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('funnels/:funnelId/enhanced')
export class FunnelEnhancedController {
  constructor(
    private readonly variantService: FunnelVariantService,
    private readonly analyticsService: FunnelAnalyticsService,
    private readonly enhancedService: FunnelEnhancedService,
  ) {}

  // ===== A/B Testing / Variants =====

  @Post('variants')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Create funnel variant for A/B testing' })
  async createVariant(
    @Param('funnelId') funnelId: string,
    @Body() createDto: CreateFunnelVariantDto,
    @Req() req: any,
  ) {
    return this.variantService.create(funnelId, createDto, req.user.tenantId);
  }

  @Get('variants')
  @ApiOperation({ summary: 'Get all variants for funnel' })
  async getVariants(@Param('funnelId') funnelId: string, @Req() req: any) {
    return this.variantService.findAll(funnelId, req.user.tenantId);
  }

  @Get('variants/comparison')
  @ApiOperation({ summary: 'Get variant performance comparison' })
  async getVariantComparison(@Param('funnelId') funnelId: string, @Req() req: any) {
    return this.variantService.getComparison(funnelId, req.user.tenantId);
  }

  @Put('variants/:variantId')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update funnel variant' })
  async updateVariant(
    @Param('variantId') variantId: string,
    @Body() updateDto: UpdateFunnelVariantDto,
    @Req() req: any,
  ) {
    return this.variantService.update(variantId, updateDto, req.user.tenantId);
  }

  @Post('variants/declare-winner')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Declare A/B test winner' })
  async declareWinner(
    @Param('funnelId') funnelId: string,
    @Body() declareDto: DeclareWinnerDto,
    @Req() req: any,
  ) {
    return this.variantService.declareWinner(funnelId, declareDto, req.user.tenantId);
  }

  @Delete('variants/:variantId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete funnel variant' })
  async deleteVariant(@Param('variantId') variantId: string, @Req() req: any) {
    await this.variantService.remove(variantId, req.user.tenantId);
    return { message: 'Variant deleted successfully' };
  }

  // ===== Analytics =====

  @Get('analytics')
  @ApiOperation({ summary: 'Get funnel analytics' })
  async getAnalytics(
    @Param('funnelId') funnelId: string,
    @Query() queryDto: FunnelAnalyticsQueryDto,
    @Req() req: any,
  ) {
    return this.analyticsService.getAnalytics(funnelId, queryDto, req.user.tenantId);
  }

  @Get('insights')
  @ApiOperation({ summary: 'Get funnel insights and recommendations' })
  async getInsights(
    @Param('funnelId') funnelId: string,
    @Query() insightsDto: FunnelInsightsDto,
    @Req() req: any,
  ) {
    return this.analyticsService.generateInsights(
      funnelId,
      req.user.tenantId,
      insightsDto.days || 30,
    );
  }

  @Post('track-session')
  @ApiOperation({ summary: 'Track visitor session' })
  async trackSession(
    @Param('funnelId') funnelId: string,
    @Body() trackDto: TrackSessionDto,
    @Req() req: any,
  ) {
    return this.analyticsService.trackSession(
      { ...trackDto, funnelId },
      req.user.tenantId,
    );
  }

  @Post('track-event')
  @ApiOperation({ summary: 'Track funnel event' })
  async trackEvent(
    @Param('funnelId') funnelId: string,
    @Body() trackDto: TrackEventDto,
    @Req() req: any,
  ) {
    return this.analyticsService.trackEvent(
      { ...trackDto, funnelId },
      req.user.tenantId,
    );
  }

  // ===== Goals =====

  @Post('goals')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Create conversion goal' })
  async createGoal(
    @Param('funnelId') funnelId: string,
    @Body() createDto: CreateFunnelGoalDto,
    @Req() req: any,
  ) {
    return this.enhancedService.createGoal(funnelId, createDto, req.user.tenantId);
  }

  @Get('goals')
  @ApiOperation({ summary: 'Get funnel goals' })
  async getGoals(@Param('funnelId') funnelId: string, @Req() req: any) {
    return this.enhancedService.getGoals(funnelId, req.user.tenantId);
  }

  @Put('goals/:goalId')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update conversion goal' })
  async updateGoal(
    @Param('goalId') goalId: string,
    @Body() updateDto: UpdateFunnelGoalDto,
    @Req() req: any,
  ) {
    return this.enhancedService.updateGoal(goalId, updateDto, req.user.tenantId);
  }

  @Delete('goals/:goalId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete conversion goal' })
  async deleteGoal(@Param('goalId') goalId: string, @Req() req: any) {
    await this.enhancedService.deleteGoal(goalId, req.user.tenantId);
    return { message: 'Goal deleted successfully' };
  }

  // ===== Conditional Logic =====

  @Post('conditions')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Create conditional logic rule' })
  async createCondition(
    @Param('funnelId') funnelId: string,
    @Body() createDto: CreateFunnelConditionDto,
    @Req() req: any,
  ) {
    return this.enhancedService.createCondition(funnelId, createDto, req.user.tenantId);
  }

  @Get('conditions')
  @ApiOperation({ summary: 'Get funnel conditions' })
  async getConditions(@Param('funnelId') funnelId: string, @Req() req: any) {
    return this.enhancedService.getConditions(funnelId, req.user.tenantId);
  }

  @Put('conditions/:conditionId')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update conditional logic rule' })
  async updateCondition(
    @Param('conditionId') conditionId: string,
    @Body() updateDto: UpdateFunnelConditionDto,
    @Req() req: any,
  ) {
    return this.enhancedService.updateCondition(conditionId, updateDto, req.user.tenantId);
  }

  @Delete('conditions/:conditionId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete conditional logic rule' })
  async deleteCondition(@Param('conditionId') conditionId: string, @Req() req: any) {
    await this.enhancedService.deleteCondition(conditionId, req.user.tenantId);
    return { message: 'Condition deleted successfully' };
  }

  // ===== AI Suggestions =====

  @Get('suggestions')
  @ApiOperation({ summary: 'Get optimization suggestions' })
  async getSuggestions(@Param('funnelId') funnelId: string, @Req() req: any) {
    return this.enhancedService.getSuggestions(funnelId, req.user.tenantId);
  }

  @Post('suggestions/generate')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Generate new optimization suggestions' })
  async generateSuggestions(@Param('funnelId') funnelId: string, @Req() req: any) {
    return this.enhancedService.generateSuggestions(funnelId, req.user.tenantId);
  }

  @Put('suggestions/:suggestionId')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update suggestion status' })
  async updateSuggestionStatus(
    @Param('suggestionId') suggestionId: string,
    @Body() statusDto: UpdateSuggestionStatusDto,
    @Req() req: any,
  ) {
    return this.enhancedService.updateSuggestionStatus(
      suggestionId,
      statusDto,
      req.user.tenantId,
    );
  }
}
