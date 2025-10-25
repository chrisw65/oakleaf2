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
  Request,
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
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../user/user.entity';
import { AffiliateService } from '../services/affiliate.service';
import { AffiliateTrackingService } from '../services/affiliate-tracking.service';
import { Affiliate, AffiliateStatus } from '../affiliate.entity';
import {
  RegisterAffiliateDto,
  UpdateAffiliateDto,
  GenerateAffiliateLinkDto,
  TrackClickDto,
  AffiliateStatsQueryDto,
} from '../dto/affiliate.dto';

@ApiTags('Affiliates')
@Controller('affiliates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AffiliateController {
  constructor(
    private readonly affiliateService: AffiliateService,
    private readonly trackingService: AffiliateTrackingService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register as an affiliate' })
  @ApiResponse({ status: 201, description: 'Affiliate registered successfully' })
  @ApiResponse({ status: 409, description: 'User is already an affiliate' })
  async register(
    @Body() registerDto: RegisterAffiliateDto,
    @CurrentUser() user: any,
  ): Promise<Affiliate> {
    return this.affiliateService.register(
      registerDto,
      user.id,
      user.tenantId,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all affiliates (Admin only)' })
  @ApiQuery({ name: 'status', required: false, enum: AffiliateStatus })
  @ApiResponse({ status: 200, description: 'List of affiliates' })
  async findAll(
    @Query('status') status: AffiliateStatus,
    @CurrentUser() user: any,
  ): Promise<Affiliate[]> {
    return this.affiliateService.findAll(user.tenantId, status);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my affiliate account' })
  @ApiResponse({ status: 200, description: 'Current user affiliate account' })
  @ApiResponse({ status: 404, description: 'User is not an affiliate' })
  async getMyAffiliate(@CurrentUser() user: any): Promise<Affiliate | null> {
    return this.affiliateService.findByUserId(user.id, user.tenantId);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get my affiliate statistics' })
  @ApiResponse({ status: 200, description: 'Affiliate statistics' })
  async getMyStats(
    @Query() queryDto: AffiliateStatsQueryDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    const affiliate = await this.affiliateService.findByUserId(
      user.id,
      user.tenantId,
    );

    if (!affiliate) {
      throw new Error('User is not an affiliate');
    }

    return this.affiliateService.getStats(affiliate.id, user.tenantId, queryDto);
  }

  @Post('me/generate-link')
  @ApiOperation({ summary: 'Generate affiliate link' })
  @ApiResponse({ status: 200, description: 'Affiliate link generated' })
  async generateLink(
    @Body() generateDto: GenerateAffiliateLinkDto,
    @CurrentUser() user: any,
  ): Promise<{ link: string }> {
    const affiliate = await this.affiliateService.findByUserId(
      user.id,
      user.tenantId,
    );

    if (!affiliate) {
      throw new Error('User is not an affiliate');
    }

    const link = await this.affiliateService.generateLink(
      affiliate.id,
      generateDto,
      user.tenantId,
    );

    return { link };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get affiliate by ID' })
  @ApiParam({ name: 'id', description: 'Affiliate ID' })
  @ApiResponse({ status: 200, description: 'Affiliate details' })
  @ApiResponse({ status: 404, description: 'Affiliate not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Affiliate> {
    return this.affiliateService.findOne(id, user.tenantId);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get affiliate by code' })
  @ApiParam({ name: 'code', description: 'Affiliate code' })
  @ApiResponse({ status: 200, description: 'Affiliate details' })
  @ApiResponse({ status: 404, description: 'Affiliate not found' })
  async findByCode(
    @Param('code') code: string,
    @CurrentUser() user: any,
  ): Promise<Affiliate> {
    return this.affiliateService.findByCode(code, user.tenantId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update affiliate (Admin only)' })
  @ApiParam({ name: 'id', description: 'Affiliate ID' })
  @ApiResponse({ status: 200, description: 'Affiliate updated successfully' })
  @ApiResponse({ status: 404, description: 'Affiliate not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAffiliateDto,
    @CurrentUser() user: any,
  ): Promise<Affiliate> {
    return this.affiliateService.update(id, updateDto, user.tenantId);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve affiliate (Admin only)' })
  @ApiParam({ name: 'id', description: 'Affiliate ID' })
  @ApiResponse({ status: 200, description: 'Affiliate approved successfully' })
  @ApiResponse({ status: 400, description: 'Only pending affiliates can be approved' })
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Affiliate> {
    return this.affiliateService.approve(id, user.tenantId);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reject affiliate (Admin only)' })
  @ApiParam({ name: 'id', description: 'Affiliate ID' })
  @ApiResponse({ status: 200, description: 'Affiliate rejected successfully' })
  async reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ): Promise<Affiliate> {
    return this.affiliateService.reject(id, user.tenantId, reason);
  }

  @Post(':id/suspend')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Suspend affiliate (Admin only)' })
  @ApiParam({ name: 'id', description: 'Affiliate ID' })
  @ApiResponse({ status: 200, description: 'Affiliate suspended successfully' })
  async suspend(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ): Promise<Affiliate> {
    return this.affiliateService.suspend(id, user.tenantId, reason);
  }

  @Post(':id/reactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reactivate affiliate (Admin only)' })
  @ApiParam({ name: 'id', description: 'Affiliate ID' })
  @ApiResponse({ status: 200, description: 'Affiliate reactivated successfully' })
  async reactivate(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Affiliate> {
    return this.affiliateService.reactivate(id, user.tenantId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get affiliate statistics' })
  @ApiParam({ name: 'id', description: 'Affiliate ID' })
  @ApiResponse({ status: 200, description: 'Affiliate statistics' })
  async getStats(
    @Param('id') id: string,
    @Query() queryDto: AffiliateStatsQueryDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.affiliateService.getStats(id, user.tenantId, queryDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete affiliate (Admin only)' })
  @ApiParam({ name: 'id', description: 'Affiliate ID' })
  @ApiResponse({ status: 200, description: 'Affiliate deleted successfully' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.affiliateService.remove(id, user.tenantId);
    return { message: 'Affiliate deleted successfully' };
  }

  @Post('track-click')
  @ApiOperation({ summary: 'Track affiliate click' })
  @ApiResponse({ status: 200, description: 'Click tracked successfully' })
  async trackClick(
    @Body() trackClickDto: TrackClickDto,
    @CurrentUser() user: any,
  ): Promise<{ clickId: string; visitorId: string; cookieExpiry: Date }> {
    return this.trackingService.trackClick(trackClickDto, user.tenantId);
  }
}
