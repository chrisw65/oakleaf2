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
  EmailTemplateService,
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  RenderTemplateDto,
} from './email-template.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetTenant } from '../auth/get-tenant.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { Permissions } from '../rbac/permissions.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TemplateCategory, TemplateStatus } from './email-template.entity';

@ApiTags('Email Templates')
@ApiBearerAuth()
@Controller('email-templates')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmailTemplateController {
  constructor(private readonly templateService: EmailTemplateService) {}

  /**
   * Create new email template
   */
  @Post()
  @Permissions('email_templates:create')
  @ApiOperation({ summary: 'Create new email template' })
  @ApiResponse({ status: 201, description: 'Email template created' })
  async create(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Body() dto: CreateEmailTemplateDto,
  ) {
    const template = await this.templateService.create(tenantId, userId, dto);

    return {
      success: true,
      data: template,
      message: 'Email template created successfully',
    };
  }

  /**
   * Get all email templates
   */
  @Get()
  @Permissions('email_templates:read')
  @ApiOperation({ summary: 'Get all email templates' })
  @ApiResponse({ status: 200, description: 'List of email templates' })
  async findAll(
    @GetTenant() tenantId: string,
    @Query('category') category?: TemplateCategory,
    @Query('status') status?: TemplateStatus,
  ) {
    const templates = await this.templateService.findAll(tenantId, category, status);

    return {
      success: true,
      data: templates,
      count: templates.length,
    };
  }

  /**
   * Search email templates
   */
  @Get('search')
  @Permissions('email_templates:read')
  @ApiOperation({ summary: 'Search email templates' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(@GetTenant() tenantId: string, @Query('q') query: string) {
    const templates = await this.templateService.search(tenantId, query);

    return {
      success: true,
      data: templates,
      count: templates.length,
    };
  }

  /**
   * Get email template by ID
   */
  @Get(':id')
  @Permissions('email_templates:read')
  @ApiOperation({ summary: 'Get email template by ID' })
  @ApiResponse({ status: 200, description: 'Email template details' })
  async findOne(@GetTenant() tenantId: string, @Param('id') id: string) {
    const template = await this.templateService.findOne(tenantId, id);

    return {
      success: true,
      data: template,
    };
  }

  /**
   * Update email template
   */
  @Put(':id')
  @Permissions('email_templates:update')
  @ApiOperation({ summary: 'Update email template' })
  @ApiResponse({ status: 200, description: 'Email template updated' })
  async update(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmailTemplateDto,
  ) {
    const template = await this.templateService.update(tenantId, userId, id, dto);

    return {
      success: true,
      data: template,
      message: 'Email template updated successfully',
    };
  }

  /**
   * Delete email template
   */
  @Delete(':id')
  @Permissions('email_templates:delete')
  @ApiOperation({ summary: 'Delete email template' })
  @ApiResponse({ status: 200, description: 'Email template deleted' })
  async delete(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
  ) {
    await this.templateService.delete(tenantId, userId, id);

    return {
      success: true,
      message: 'Email template deleted successfully',
    };
  }

  /**
   * Clone email template
   */
  @Post(':id/clone')
  @Permissions('email_templates:create')
  @ApiOperation({ summary: 'Clone email template' })
  @ApiResponse({ status: 201, description: 'Email template cloned' })
  async clone(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
    @Body() body: { name?: string },
  ) {
    const template = await this.templateService.clone(tenantId, userId, id, body.name);

    return {
      success: true,
      data: template,
      message: 'Email template cloned successfully',
    };
  }

  /**
   * Activate email template
   */
  @Post(':id/activate')
  @Permissions('email_templates:update')
  @ApiOperation({ summary: 'Activate email template' })
  @ApiResponse({ status: 200, description: 'Email template activated' })
  async activate(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
  ) {
    const template = await this.templateService.activate(tenantId, userId, id);

    return {
      success: true,
      data: template,
      message: 'Email template activated successfully',
    };
  }

  /**
   * Archive email template
   */
  @Post(':id/archive')
  @Permissions('email_templates:update')
  @ApiOperation({ summary: 'Archive email template' })
  @ApiResponse({ status: 200, description: 'Email template archived' })
  async archive(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
  ) {
    const template = await this.templateService.archive(tenantId, userId, id);

    return {
      success: true,
      data: template,
      message: 'Email template archived successfully',
    };
  }

  /**
   * Render email template with data
   */
  @Post(':id/render')
  @Permissions('email_templates:read')
  @ApiOperation({ summary: 'Render email template with data' })
  @ApiResponse({ status: 200, description: 'Rendered email content' })
  async render(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: RenderTemplateDto,
  ) {
    const rendered = await this.templateService.render(tenantId, id, dto);

    return {
      success: true,
      data: rendered,
    };
  }

  /**
   * Preview email template
   */
  @Get(':id/preview')
  @Permissions('email_templates:read')
  @ApiOperation({ summary: 'Preview email template with sample data' })
  @ApiResponse({ status: 200, description: 'Template preview' })
  async preview(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
    @Query('sampleData') sampleData?: string,
  ) {
    const parsedData = sampleData ? JSON.parse(sampleData) : undefined;
    const preview = await this.templateService.preview(tenantId, id, parsedData);

    return {
      success: true,
      data: preview,
    };
  }

  /**
   * Get template statistics
   */
  @Get(':id/statistics')
  @Permissions('email_templates:read')
  @ApiOperation({ summary: 'Get template statistics' })
  @ApiResponse({ status: 200, description: 'Template statistics' })
  async getStatistics(@GetTenant() tenantId: string, @Param('id') id: string) {
    const stats = await this.templateService.getStatistics(tenantId, id);

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get active templates by category
   */
  @Get('category/:category/active')
  @Permissions('email_templates:read')
  @ApiOperation({ summary: 'Get active templates by category' })
  @ApiResponse({ status: 200, description: 'List of active templates' })
  async findActiveByCategory(
    @GetTenant() tenantId: string,
    @Param('category') category: TemplateCategory,
  ) {
    const templates = await this.templateService.findActiveByCategory(tenantId, category);

    return {
      success: true,
      data: templates,
      count: templates.length,
    };
  }
}
