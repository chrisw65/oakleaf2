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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WebhookService, CreateWebhookDto, UpdateWebhookDto } from './webhook.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetTenant } from '../auth/get-tenant.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Webhooks')
@ApiBearerAuth()
@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Create new webhook
   */
  @Post()
  @ApiOperation({ summary: 'Create new webhook' })
  @ApiResponse({ status: 201, description: 'Webhook created successfully' })
  async create(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Body() dto: CreateWebhookDto,
  ) {
    const webhook = await this.webhookService.create(tenantId, userId, dto);
    return {
      success: true,
      data: webhook,
      message: 'Webhook created successfully',
    };
  }

  /**
   * Get all webhooks
   */
  @Get()
  @ApiOperation({ summary: 'Get all webhooks' })
  @ApiResponse({ status: 200, description: 'List of webhooks' })
  async findAll(@GetTenant() tenantId: string) {
    const webhooks = await this.webhookService.findAll(tenantId);
    return {
      success: true,
      data: webhooks,
      total: webhooks.length,
    };
  }

  /**
   * Get webhook by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get webhook by ID' })
  @ApiResponse({ status: 200, description: 'Webhook details' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async findOne(@GetTenant() tenantId: string, @Param('id') id: string) {
    const webhook = await this.webhookService.findOne(tenantId, id);
    return {
      success: true,
      data: webhook,
    };
  }

  /**
   * Update webhook
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update webhook' })
  @ApiResponse({ status: 200, description: 'Webhook updated successfully' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async update(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWebhookDto,
  ) {
    const webhook = await this.webhookService.update(tenantId, id, dto);
    return {
      success: true,
      data: webhook,
      message: 'Webhook updated successfully',
    };
  }

  /**
   * Delete webhook
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete webhook' })
  @ApiResponse({ status: 204, description: 'Webhook deleted successfully' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async delete(@GetTenant() tenantId: string, @Param('id') id: string) {
    await this.webhookService.delete(tenantId, id);
  }

  /**
   * Test webhook (send test event)
   */
  @Post(':id/test')
  @ApiOperation({ summary: 'Send test webhook' })
  @ApiResponse({ status: 200, description: 'Test webhook queued' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async test(@GetTenant() tenantId: string, @Param('id') id: string) {
    await this.webhookService.testWebhook(tenantId, id);
    return {
      success: true,
      message: 'Test webhook queued for delivery',
    };
  }

  /**
   * Get webhook statistics
   */
  @Get(':id/stats')
  @ApiOperation({ summary: 'Get webhook statistics' })
  @ApiResponse({ status: 200, description: 'Webhook statistics' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async getStats(@GetTenant() tenantId: string, @Param('id') id: string) {
    const stats = await this.webhookService.getStats(tenantId, id);
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get webhook delivery attempts
   */
  @Get(':id/attempts')
  @ApiOperation({ summary: 'Get webhook delivery attempts' })
  @ApiResponse({ status: 200, description: 'List of delivery attempts' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async getAttempts(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    const attempts = await this.webhookService.getAttempts(
      tenantId,
      id,
      limit ? parseInt(String(limit)) : 50,
    );
    return {
      success: true,
      data: attempts,
      total: attempts.length,
    };
  }

  /**
   * Enable webhook
   */
  @Post(':id/enable')
  @ApiOperation({ summary: 'Enable webhook' })
  @ApiResponse({ status: 200, description: 'Webhook enabled' })
  async enable(@GetTenant() tenantId: string, @Param('id') id: string) {
    const webhook = await this.webhookService.update(tenantId, id, {
      status: 'active' as any,
    });
    return {
      success: true,
      data: webhook,
      message: 'Webhook enabled',
    };
  }

  /**
   * Disable webhook
   */
  @Post(':id/disable')
  @ApiOperation({ summary: 'Disable webhook' })
  @ApiResponse({ status: 200, description: 'Webhook disabled' })
  async disable(@GetTenant() tenantId: string, @Param('id') id: string) {
    const webhook = await this.webhookService.update(tenantId, id, {
      status: 'disabled' as any,
    });
    return {
      success: true,
      data: webhook,
      message: 'Webhook disabled',
    };
  }

  /**
   * Get available webhook events
   */
  @Get('/meta/events')
  @ApiOperation({ summary: 'Get available webhook events' })
  @ApiResponse({ status: 200, description: 'List of available events' })
  async getEvents() {
    // Import WebhookEvent enum
    const { WebhookEvent } = await import('./webhook.entity');
    const events = Object.values(WebhookEvent).map((event) => ({
      value: event,
      label: this.formatEventLabel(event),
      category: this.getEventCategory(event),
    }));

    return {
      success: true,
      data: events,
    };
  }

  /**
   * Verify webhook signature (for testing)
   */
  @Post('/verify-signature')
  @ApiOperation({ summary: 'Verify webhook signature' })
  @ApiResponse({ status: 200, description: 'Signature verification result' })
  async verifySignature(
    @Body()
    dto: {
      payload: string;
      signature: string;
      secret: string;
    },
  ) {
    const isValid = this.webhookService.verifySignature(
      dto.payload,
      dto.signature,
      dto.secret,
    );
    return {
      success: true,
      valid: isValid,
    };
  }

  /**
   * Format event name for display
   */
  private formatEventLabel(event: string): string {
    return event
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' - ');
  }

  /**
   * Get event category
   */
  private getEventCategory(event: string): string {
    const [category] = event.split('.');
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
}
