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
import { PayoutService } from '../services/payout.service';
import { AffiliateService } from '../services/affiliate.service';
import { Payout } from '../payout.entity';
import {
  CreatePayoutDto,
  UpdatePayoutDto,
  RequestPayoutDto,
  ProcessPayoutDto,
  BatchPayoutDto,
  PayoutQueryDto,
} from '../dto/payout.dto';

@ApiTags('Payouts')
@Controller('payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PayoutController {
  constructor(
    private readonly payoutService: PayoutService,
    private readonly affiliateService: AffiliateService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create payout (Admin only)' })
  @ApiResponse({ status: 201, description: 'Payout created successfully' })
  async create(
    @Body() createPayoutDto: CreatePayoutDto,
    @CurrentUser() user: any,
  ): Promise<Payout> {
    return this.payoutService.create(createPayoutDto, user.tenantId);
  }

  @Post('request')
  @ApiOperation({ summary: 'Request payout (for current affiliate)' })
  @ApiResponse({ status: 201, description: 'Payout requested successfully' })
  @ApiResponse({ status: 400, description: 'Minimum payout amount not met or no payable commissions' })
  async requestPayout(
    @Body() requestDto: RequestPayoutDto,
    @CurrentUser() user: any,
  ): Promise<Payout> {
    const affiliate = await this.affiliateService.findByUserId(
      user.id,
      user.tenantId,
    );

    if (!affiliate) {
      throw new Error('User is not an affiliate');
    }

    return this.payoutService.requestPayout(
      affiliate.id,
      requestDto,
      user.tenantId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all payouts' })
  @ApiResponse({ status: 200, description: 'List of payouts' })
  async findAll(
    @Query() queryDto: PayoutQueryDto,
    @CurrentUser() user: any,
  ): Promise<{ data: Payout[]; total: number; page: number; limit: number }> {
    return this.payoutService.findAll(queryDto, user.tenantId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my payouts (for current affiliate)' })
  @ApiResponse({ status: 200, description: 'List of my payouts' })
  async getMyPayouts(
    @Query() queryDto: PayoutQueryDto,
    @CurrentUser() user: any,
  ): Promise<{ data: Payout[]; total: number; page: number; limit: number }> {
    const affiliate = await this.affiliateService.findByUserId(
      user.id,
      user.tenantId,
    );

    if (!affiliate) {
      return { data: [], total: 0, page: 1, limit: 20 };
    }

    queryDto.affiliateId = affiliate.id;
    return this.payoutService.findAll(queryDto, user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payout by ID' })
  @ApiParam({ name: 'id', description: 'Payout ID' })
  @ApiResponse({ status: 200, description: 'Payout details' })
  @ApiResponse({ status: 404, description: 'Payout not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Payout> {
    return this.payoutService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update payout (Admin only)' })
  @ApiParam({ name: 'id', description: 'Payout ID' })
  @ApiResponse({ status: 200, description: 'Payout updated successfully' })
  @ApiResponse({ status: 404, description: 'Payout not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePayoutDto: UpdatePayoutDto,
    @CurrentUser() user: any,
  ): Promise<Payout> {
    return this.payoutService.update(id, updatePayoutDto, user.tenantId);
  }

  @Post('process')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Process payout (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payout processed successfully' })
  @ApiResponse({ status: 400, description: 'Only pending payouts can be processed' })
  async processPayout(
    @Body() processDto: ProcessPayoutDto,
    @CurrentUser() user: any,
  ): Promise<Payout> {
    return this.payoutService.processPayout(processDto, user.tenantId);
  }

  @Post(':id/fail')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Fail payout (Admin only)' })
  @ApiParam({ name: 'id', description: 'Payout ID' })
  @ApiResponse({ status: 200, description: 'Payout failed successfully' })
  async failPayout(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ): Promise<Payout> {
    return this.payoutService.failPayout(id, user.tenantId, reason);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel payout' })
  @ApiParam({ name: 'id', description: 'Payout ID' })
  @ApiResponse({ status: 200, description: 'Payout cancelled successfully' })
  async cancelPayout(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Payout> {
    return this.payoutService.cancelPayout(id, user.tenantId);
  }

  @Post('batch')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Process batch payouts (Admin only)' })
  @ApiResponse({ status: 201, description: 'Batch payouts created successfully' })
  async processBatchPayouts(
    @Body() batchDto: BatchPayoutDto,
    @CurrentUser() user: any,
  ): Promise<Payout[]> {
    return this.payoutService.processBatchPayouts(batchDto, user.tenantId);
  }

  @Get('stats/overview')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get payout statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payout statistics' })
  async getStats(
    @Query('startDate') startDate: string | undefined,
    @Query('endDate') endDate: string | undefined,
    @CurrentUser() user: any,
  ): Promise<any> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.payoutService.getStats(user.tenantId, start, end);
  }
}
