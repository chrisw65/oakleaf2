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
import {
  EmailAutomationService,
  CreateSequenceDto,
  UpdateSequenceDto,
  EnrollSubscriberDto,
} from './email-automation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetTenant } from '../auth/get-tenant.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { Permissions } from '../rbac/permissions.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SequenceStatus } from './email-sequence.entity';

@ApiTags('Email Automation')
@ApiBearerAuth()
@Controller('email-sequences')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmailAutomationController {
  constructor(private readonly automationService: EmailAutomationService) {}

  @Post()
  @Permissions('email_sequences:create')
  async create(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Body() dto: CreateSequenceDto,
  ) {
    const sequence = await this.automationService.createSequence(tenantId, userId, dto);
    return { success: true, data: sequence };
  }

  @Get()
  @Permissions('email_sequences:read')
  async findAll(@GetTenant() tenantId: string, @Query('status') status?: SequenceStatus) {
    const sequences = await this.automationService.findAll(tenantId, status);
    return { success: true, data: sequences, count: sequences.length };
  }

  @Get(':id')
  @Permissions('email_sequences:read')
  async findOne(@GetTenant() tenantId: string, @Param('id') id: string) {
    const sequence = await this.automationService.findOne(tenantId, id);
    return { success: true, data: sequence };
  }

  @Put(':id')
  @Permissions('email_sequences:update')
  async update(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSequenceDto,
  ) {
    const sequence = await this.automationService.updateSequence(tenantId, userId, id, dto);
    return { success: true, data: sequence };
  }

  @Post(':id/activate')
  @Permissions('email_sequences:update')
  async activate(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
  ) {
    const sequence = await this.automationService.activateSequence(tenantId, userId, id);
    return { success: true, data: sequence };
  }

  @Post(':id/pause')
  @Permissions('email_sequences:update')
  async pause(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
  ) {
    const sequence = await this.automationService.pauseSequence(tenantId, userId, id);
    return { success: true, data: sequence };
  }

  @Post(':id/enroll')
  @Permissions('email_sequences:update')
  async enroll(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
    @Body() dto: EnrollSubscriberDto,
  ) {
    const subscriber = await this.automationService.enrollSubscriber(tenantId, userId, id, dto);
    return { success: true, data: subscriber };
  }

  @Post(':id/unsubscribe/:subscriberId')
  @Permissions('email_sequences:update')
  async unsubscribe(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
    @Param('subscriberId') subscriberId: string,
  ) {
    await this.automationService.unsubscribeSubscriber(tenantId, userId, id, subscriberId);
    return { success: true };
  }

  @Get(':id/statistics')
  @Permissions('email_sequences:read')
  async getStatistics(@GetTenant() tenantId: string, @Param('id') id: string) {
    const stats = await this.automationService.getStatistics(tenantId, id);
    return { success: true, data: stats };
  }

  @Post('process-pending')
  @Permissions('email_sequences:update')
  async processPending(@GetTenant() tenantId: string) {
    const count = await this.automationService.processPendingSubscribers(tenantId);
    return { success: true, data: { processed: count } };
  }
}
