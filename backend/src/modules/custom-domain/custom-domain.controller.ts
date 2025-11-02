import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CustomDomainService } from './custom-domain.service';
import type {
  CreateCustomDomainDto,
  UpdateCustomDomainDto,
} from './custom-domain.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetTenant } from '../../common/decorators/get-tenant.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Permissions } from '../rbac/decorators/permissions.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DomainType } from './custom-domain.entity';

@ApiTags('Custom Domains')
@ApiBearerAuth()
@Controller('custom-domains')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CustomDomainController {
  constructor(private readonly customDomainService: CustomDomainService) {}

  /**
   * Create new custom domain
   */
  @Post()
  @Permissions('domains:create')
  @ApiOperation({ summary: 'Create new custom domain' })
  @ApiResponse({ status: 201, description: 'Custom domain created' })
  async create(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Body() dto: CreateCustomDomainDto,
  ) {
    const customDomain = await this.customDomainService.create(tenantId, userId, dto);

    return {
      success: true,
      data: customDomain,
      message: `Custom domain created. Please configure your DNS records to verify ownership.`,
    };
  }

  /**
   * Get all custom domains for tenant
   */
  @Get()
  @Permissions('domains:read')
  @ApiOperation({ summary: 'Get all custom domains' })
  @ApiResponse({ status: 200, description: 'List of custom domains' })
  async findAll(@GetTenant() tenantId: string) {
    const domains = await this.customDomainService.findAll(tenantId);

    return {
      success: true,
      data: domains,
      count: domains.length,
    };
  }

  /**
   * Get custom domain by ID
   */
  @Get(':id')
  @Permissions('domains:read')
  @ApiOperation({ summary: 'Get custom domain by ID' })
  @ApiResponse({ status: 200, description: 'Custom domain details' })
  async findOne(@GetTenant() tenantId: string, @Param('id') id: string) {
    const domain = await this.customDomainService.findOne(tenantId, id);

    return {
      success: true,
      data: domain,
    };
  }

  /**
   * Get domains by resource
   */
  @Get('resource/:type/:resourceId')
  @Permissions('domains:read')
  @ApiOperation({ summary: 'Get domains by resource type and ID' })
  @ApiResponse({ status: 200, description: 'List of domains for resource' })
  async findByResource(
    @GetTenant() tenantId: string,
    @Param('type') type: DomainType,
    @Param('resourceId') resourceId: string,
  ) {
    const domains = await this.customDomainService.findByResource(
      tenantId,
      type,
      resourceId,
    );

    return {
      success: true,
      data: domains,
      count: domains.length,
    };
  }

  /**
   * Verify domain DNS records
   */
  @Post(':id/verify')
  @Permissions('domains:update')
  @ApiOperation({ summary: 'Verify domain DNS records' })
  @ApiResponse({ status: 200, description: 'Domain verification result' })
  async verify(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
  ) {
    const result = await this.customDomainService.verifyDomain(tenantId, userId, id);

    return {
      success: result.verified,
      data: result,
      message: result.verified
        ? 'Domain verified successfully!'
        : `Domain verification failed: ${result.message}`,
    };
  }

  /**
   * Activate domain
   */
  @Post(':id/activate')
  @Permissions('domains:update')
  @ApiOperation({ summary: 'Activate domain' })
  @ApiResponse({ status: 200, description: 'Domain activated' })
  async activate(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
  ) {
    const domain = await this.customDomainService.activate(tenantId, userId, id);

    return {
      success: true,
      data: domain,
      message: 'Domain activated successfully',
    };
  }

  /**
   * Suspend domain
   */
  @Post(':id/suspend')
  @Permissions('domains:update')
  @ApiOperation({ summary: 'Suspend domain' })
  @ApiResponse({ status: 200, description: 'Domain suspended' })
  async suspend(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    const domain = await this.customDomainService.suspend(
      tenantId,
      userId,
      id,
      body.reason,
    );

    return {
      success: true,
      data: domain,
      message: 'Domain suspended',
    };
  }

  /**
   * Update custom domain
   */
  @Put(':id')
  @Permissions('domains:update')
  @ApiOperation({ summary: 'Update custom domain' })
  @ApiResponse({ status: 200, description: 'Custom domain updated' })
  async update(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomDomainDto,
  ) {
    const domain = await this.customDomainService.update(tenantId, userId, id, dto);

    return {
      success: true,
      data: domain,
      message: 'Custom domain updated',
    };
  }

  /**
   * Delete custom domain
   */
  @Delete(':id')
  @Permissions('domains:delete')
  @ApiOperation({ summary: 'Delete custom domain' })
  @ApiResponse({ status: 200, description: 'Custom domain deleted' })
  async delete(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
  ) {
    await this.customDomainService.delete(tenantId, userId, id);

    return {
      success: true,
      message: 'Custom domain deleted',
    };
  }

  /**
   * Enable SSL for domain
   */
  @Post(':id/ssl/enable')
  @Permissions('domains:update')
  @ApiOperation({ summary: 'Enable SSL for domain' })
  @ApiResponse({ status: 200, description: 'SSL enabled' })
  async enableSsl(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
    @Body() body: { provider?: string },
  ) {
    const domain = await this.customDomainService.enableSsl(
      tenantId,
      userId,
      id,
      body.provider,
    );

    return {
      success: true,
      data: domain,
      message: 'SSL enabled successfully',
    };
  }

  /**
   * Renew SSL certificate
   */
  @Post(':id/ssl/renew')
  @Permissions('domains:update')
  @ApiOperation({ summary: 'Renew SSL certificate' })
  @ApiResponse({ status: 200, description: 'SSL renewed' })
  async renewSsl(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    const domain = await this.customDomainService.renewSsl(tenantId, id);

    return {
      success: true,
      data: domain,
      message: 'SSL certificate renewed',
    };
  }

  /**
   * Get domain statistics
   */
  @Get(':id/stats')
  @Permissions('domains:read')
  @ApiOperation({ summary: 'Get domain statistics' })
  @ApiResponse({ status: 200, description: 'Domain statistics' })
  async getStats(@GetTenant() tenantId: string, @Param('id') id: string) {
    const stats = await this.customDomainService.getStats(tenantId, id);

    return {
      success: true,
      data: stats,
    };
  }
}
