import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../user/user.entity';
import { CommissionService } from '../services/commission.service';
import { Commission } from '../commission.entity';
import {
  CreateCommissionDto,
  UpdateCommissionDto,
  ApproveCommissionDto,
  RejectCommissionDto,
  CommissionQueryDto,
} from '../dto/commission.dto';

@ApiTags('Commissions')
@Controller('commissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create commission (Admin only)' })
  @ApiResponse({ status: 201, description: 'Commission created successfully' })
  async create(
    @Body() createCommissionDto: CreateCommissionDto,
    @CurrentUser() user: any,
  ): Promise<Commission> {
    return this.commissionService.create(createCommissionDto, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all commissions' })
  @ApiResponse({ status: 200, description: 'List of commissions' })
  async findAll(
    @Query() queryDto: CommissionQueryDto,
    @CurrentUser() user: any,
  ): Promise<{ data: Commission[]; total: number; page: number; limit: number }> {
    return this.commissionService.findAll(queryDto, user.tenantId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my commissions (for current affiliate)' })
  @ApiResponse({ status: 200, description: 'List of my commissions' })
  async getMyCommissions(
    @Query() queryDto: CommissionQueryDto,
    @CurrentUser() user: any,
  ): Promise<{ data: Commission[]; total: number; page: number; limit: number }> {
    // This would require getting the affiliate ID for the current user
    // For now, we'll use the general query
    return this.commissionService.findAll(queryDto, user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get commission by ID' })
  @ApiParam({ name: 'id', description: 'Commission ID' })
  @ApiResponse({ status: 200, description: 'Commission details' })
  @ApiResponse({ status: 404, description: 'Commission not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Commission> {
    return this.commissionService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update commission (Admin only)' })
  @ApiParam({ name: 'id', description: 'Commission ID' })
  @ApiResponse({ status: 200, description: 'Commission updated successfully' })
  @ApiResponse({ status: 404, description: 'Commission not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCommissionDto: UpdateCommissionDto,
    @CurrentUser() user: any,
  ): Promise<Commission> {
    return this.commissionService.update(id, updateCommissionDto, user.tenantId);
  }

  @Post('approve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve commission (Admin only)' })
  @ApiResponse({ status: 200, description: 'Commission approved successfully' })
  @ApiResponse({ status: 400, description: 'Only pending commissions can be approved' })
  async approve(
    @Body() approveDto: ApproveCommissionDto,
    @CurrentUser() user: any,
  ): Promise<Commission> {
    return this.commissionService.approve(
      approveDto.commissionId,
      user.tenantId,
      approveDto.notes,
    );
  }

  @Post('reject')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reject commission (Admin only)' })
  @ApiResponse({ status: 200, description: 'Commission rejected successfully' })
  @ApiResponse({ status: 400, description: 'Only pending commissions can be rejected' })
  async reject(
    @Body() rejectDto: RejectCommissionDto,
    @CurrentUser() user: any,
  ): Promise<Commission> {
    return this.commissionService.reject(
      rejectDto.commissionId,
      user.tenantId,
      rejectDto.reason,
    );
  }

  @Get('affiliate/:affiliateId/pending')
  @ApiOperation({ summary: 'Get pending commissions for an affiliate' })
  @ApiParam({ name: 'affiliateId', description: 'Affiliate ID' })
  @ApiResponse({ status: 200, description: 'List of pending commissions' })
  async getPendingCommissions(
    @Param('affiliateId') affiliateId: string,
    @CurrentUser() user: any,
  ): Promise<Commission[]> {
    return this.commissionService.getPendingCommissions(affiliateId, user.tenantId);
  }

  @Get('affiliate/:affiliateId/payable')
  @ApiOperation({ summary: 'Get payable commissions for an affiliate' })
  @ApiParam({ name: 'affiliateId', description: 'Affiliate ID' })
  @ApiResponse({ status: 200, description: 'List of payable commissions' })
  async getPayableCommissions(
    @Param('affiliateId') affiliateId: string,
    @CurrentUser() user: any,
  ): Promise<Commission[]> {
    return this.commissionService.getPayableCommissions(affiliateId, user.tenantId);
  }

  @Get('affiliate/:affiliateId/stats')
  @ApiOperation({ summary: 'Get commission statistics for an affiliate' })
  @ApiParam({ name: 'affiliateId', description: 'Affiliate ID' })
  @ApiResponse({ status: 200, description: 'Commission statistics' })
  async getStats(
    @Param('affiliateId') affiliateId: string,
    @Query('startDate') startDate: string | undefined,
    @Query('endDate') endDate: string | undefined,
    @CurrentUser() user: any,
  ): Promise<any> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.commissionService.getStats(
      affiliateId,
      user.tenantId,
      start,
      end,
    );
  }
}
