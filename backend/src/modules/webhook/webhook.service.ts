import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook, WebhookEvent, WebhookStatus } from './webhook.entity';
import { WebhookAttempt, WebhookAttemptStatus } from './webhook-attempt.entity';
import { QueueService } from '../../common/queue/queue.service';
import * as crypto from 'crypto';

export interface CreateWebhookDto {
  name: string;
  description?: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  headers?: Record<string, string>;
  filters?: any;
  maxRetries?: number;
  timeoutMs?: number;
  verifySSL?: boolean;
}

export interface UpdateWebhookDto extends Partial<CreateWebhookDto> {
  status?: WebhookStatus;
}

export interface TriggerWebhookData {
  event: WebhookEvent;
  data: Record<string, any>;
  tenantId: string;
}

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepository: Repository<Webhook>,
    @InjectRepository(WebhookAttempt)
    private readonly attemptRepository: Repository<WebhookAttempt>,
    private readonly queueService: QueueService,
  ) {}

  /**
   * Create a new webhook
   */
  async create(
    tenantId: string,
    userId: string,
    dto: CreateWebhookDto,
  ): Promise<Webhook> {
    const webhook = this.webhookRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
      status: WebhookStatus.ACTIVE,
    });

    return await this.webhookRepository.save(webhook);
  }

  /**
   * Update webhook
   */
  async update(
    tenantId: string,
    webhookId: string,
    dto: UpdateWebhookDto,
  ): Promise<Webhook> {
    const webhook = await this.findOne(tenantId, webhookId);
    Object.assign(webhook, dto);
    return await this.webhookRepository.save(webhook);
  }

  /**
   * Delete webhook
   */
  async delete(tenantId: string, webhookId: string): Promise<void> {
    const webhook = await this.findOne(tenantId, webhookId);
    await this.webhookRepository.remove(webhook);
  }

  /**
   * Find one webhook
   */
  async findOne(tenantId: string, webhookId: string): Promise<Webhook> {
    const webhook = await this.webhookRepository.findOne({
      where: { id: webhookId, tenantId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return webhook;
  }

  /**
   * Find all webhooks for tenant
   */
  async findAll(tenantId: string): Promise<Webhook[]> {
    return await this.webhookRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find webhooks by event
   */
  async findByEvent(tenantId: string, event: WebhookEvent): Promise<Webhook[]> {
    return await this.webhookRepository
      .createQueryBuilder('webhook')
      .where('webhook.tenantId = :tenantId', { tenantId })
      .andWhere('webhook.status = :status', { status: WebhookStatus.ACTIVE })
      .andWhere(':event = ANY(webhook.events)', { event })
      .getMany();
  }

  /**
   * Trigger webhooks for an event
   */
  async trigger(data: TriggerWebhookData): Promise<void> {
    const { event, tenantId } = data;

    // Find all active webhooks for this event
    const webhooks = await this.findByEvent(tenantId, event);

    if (webhooks.length === 0) {
      return;
    }

    // Queue webhook delivery for each webhook
    for (const webhook of webhooks) {
      // Check filters
      if (!this.matchesFilters(webhook, data.data)) {
        continue;
      }

      await this.queueService.addWebhookJob('deliver-webhook', {
        webhookId: webhook.id,
        event,
        payload: data.data,
        tenantId,
      });
    }
  }

  /**
   * Check if data matches webhook filters
   */
  private matchesFilters(webhook: Webhook, data: Record<string, any>): boolean {
    if (!webhook.filters || Object.keys(webhook.filters).length === 0) {
      return true;
    }

    // Check funnel ID filter
    if (webhook.filters.funnelIds && data.funnelId) {
      if (!webhook.filters.funnelIds.includes(data.funnelId)) {
        return false;
      }
    }

    // Check product ID filter
    if (webhook.filters.productIds && data.productId) {
      if (!webhook.filters.productIds.includes(data.productId)) {
        return false;
      }
    }

    // Check tag filter
    if (webhook.filters.tags && data.tags) {
      const hasTags = webhook.filters.tags.some((tag: string) =>
        data.tags.includes(tag),
      );
      if (!hasTags) {
        return false;
      }
    }

    // Check custom conditions
    if (webhook.filters.conditions) {
      for (const condition of webhook.filters.conditions) {
        if (!this.evaluateCondition(condition, data)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Evaluate a filter condition
   */
  private evaluateCondition(condition: any, data: Record<string, any>): boolean {
    const { field, operator, value } = condition;
    const fieldValue = data[field];

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'greater_than':
        return fieldValue > value;
      case 'less_than':
        return fieldValue < value;
      case 'contains':
        return String(fieldValue).includes(value);
      case 'starts_with':
        return String(fieldValue).startsWith(value);
      case 'ends_with':
        return String(fieldValue).endsWith(value);
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      default:
        return true;
    }
  }

  /**
   * Record webhook attempt
   */
  async recordAttempt(
    tenantId: string,
    webhookId: string,
    event: string,
    payload: Record<string, any>,
    url: string,
    attemptNumber: number = 1,
  ): Promise<WebhookAttempt> {
    const attempt = this.attemptRepository.create({
      webhookId,
      event,
      payload,
      url,
      status: WebhookAttemptStatus.PENDING,
      attemptNumber,
      tenantId,
    });

    return await this.attemptRepository.save(attempt);
  }

  /**
   * Update attempt with result
   */
  async updateAttempt(
    attemptId: string,
    result: {
      status: WebhookAttemptStatus;
      httpStatus?: number;
      responseBody?: string;
      responseHeaders?: Record<string, string>;
      errorMessage?: string;
      durationMs?: number;
    },
  ): Promise<void> {
    await this.attemptRepository.update(attemptId, {
      ...result,
      completedAt: new Date(),
    });

    // Update webhook statistics
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
    });

    if (attempt) {
      await this.updateWebhookStats(attempt.webhookId, result.status);
    }
  }

  /**
   * Update webhook statistics
   */
  private async updateWebhookStats(
    webhookId: string,
    status: WebhookAttemptStatus,
  ): Promise<void> {
    const webhook = await this.webhookRepository.findOne({
      where: { id: webhookId },
    });

    if (!webhook) {
      return;
    }

    webhook.totalAttempts += 1;
    webhook.lastTriggeredAt = new Date();

    if (status === WebhookAttemptStatus.SUCCESS) {
      webhook.successfulAttempts += 1;
      webhook.lastSuccessAt = new Date();
      webhook.consecutiveFailures = 0;
    } else if (status === WebhookAttemptStatus.FAILED) {
      webhook.failedAttempts += 1;
      webhook.lastFailureAt = new Date();
      webhook.consecutiveFailures += 1;

      // Disable webhook after too many consecutive failures
      if (webhook.consecutiveFailures >= 10) {
        webhook.status = WebhookStatus.DISABLED;
      }
    }

    await this.webhookRepository.save(webhook);
  }

  /**
   * Get webhook attempts
   */
  async getAttempts(
    tenantId: string,
    webhookId: string,
    limit: number = 50,
  ): Promise<WebhookAttempt[]> {
    return await this.attemptRepository.find({
      where: { webhookId, tenantId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Generate webhook signature
   */
  generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Test webhook (send test event)
   */
  async testWebhook(tenantId: string, webhookId: string): Promise<void> {
    const webhook = await this.findOne(tenantId, webhookId);

    await this.queueService.addWebhookJob('deliver-webhook', {
      webhookId: webhook.id,
      event: 'test',
      payload: {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'This is a test webhook',
      },
      tenantId,
    });
  }

  /**
   * Get webhook statistics
   */
  async getStats(tenantId: string, webhookId: string): Promise<any> {
    const webhook = await this.findOne(tenantId, webhookId);

    const successRate =
      webhook.totalAttempts > 0
        ? (webhook.successfulAttempts / webhook.totalAttempts) * 100
        : 0;

    return {
      totalAttempts: webhook.totalAttempts,
      successfulAttempts: webhook.successfulAttempts,
      failedAttempts: webhook.failedAttempts,
      successRate: successRate.toFixed(2),
      consecutiveFailures: webhook.consecutiveFailures,
      lastTriggeredAt: webhook.lastTriggeredAt,
      lastSuccessAt: webhook.lastSuccessAt,
      lastFailureAt: webhook.lastFailureAt,
    };
  }
}
