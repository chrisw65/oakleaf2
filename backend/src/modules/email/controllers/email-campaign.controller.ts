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
import { UserRole } from '../../user/user.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { EmailCampaignService } from '../services/email-campaign.service';
import {
  CreateEmailCampaignDto,
  UpdateEmailCampaignDto,
  EmailCampaignQueryDto,
  SendCampaignDto,
} from '../dto/email-campaign.dto';

@ApiTags('Email Campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('email/campaigns')
export class EmailCampaignController {
  constructor(private readonly emailCampaignService: EmailCampaignService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Create email campaign' })
  async create(@Body() createDto: CreateEmailCampaignDto, @Req() req: any) {
    return this.emailCampaignService.create(
      createDto,
      req.user.tenantId,
      req.user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all email campaigns' })
  async findAll(@Query() queryDto: EmailCampaignQueryDto, @Req() req: any) {
    return this.emailCampaignService.findAll(queryDto, req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get email campaign by ID' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.emailCampaignService.findOne(id, req.user.tenantId);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get campaign statistics' })
  async getStatistics(@Param('id') id: string, @Req() req: any) {
    return this.emailCampaignService.getStatistics(id, req.user.tenantId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update email campaign' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmailCampaignDto,
    @Req() req: any,
  ) {
    return this.emailCampaignService.update(id, updateDto, req.user.tenantId);
  }

  @Post(':id/schedule')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Schedule or send campaign' })
  async schedule(
    @Param('id') id: string,
    @Body() scheduleDto: SendCampaignDto,
    @Req() req: any,
  ) {
    return this.emailCampaignService.schedule(id, scheduleDto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete email campaign' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.emailCampaignService.remove(id, req.user.tenantId);
    return { message: 'Campaign deleted successfully' };
  }
}
