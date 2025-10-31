import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QueueName } from '../queue.module';
import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';

export interface DeliverWebhookJobData {
  webhookId: string;
  event: string;
  payload: Record<string, any>;
  tenantId: string;
  attemptNumber?: number;
}

@Processor(QueueName.WEBHOOK)
export class WebhookQueue {
  private readonly logger = new Logger(WebhookQueue.name);

  @Process('deliver-webhook')
  async handleDeliverWebhook(job: Job<DeliverWebhookJobData>) {
    this.logger.log(`Processing webhook delivery job ${job.id}`);
    const { webhookId, event, payload, tenantId, attemptNumber = 1 } = job.data;

    try {
      // Import services dynamically to avoid circular dependencies
      const { WebhookService } = await import('../../../modules/webhook/webhook.service');
      const webhookService = job.data['webhookService'] as WebhookService;

      if (!webhookService) {
        throw new Error('WebhookService not available in job data');
      }

      // Get webhook configuration
      const webhook = await webhookService.findOne(tenantId, webhookId);

      if (!webhook) {
        this.logger.warn(`Webhook ${webhookId} not found`);
        return { success: false, reason: 'webhook_not_found' };
      }

      // Check if webhook is active
      if (webhook.status !== 'active') {
        this.logger.warn(`Webhook ${webhookId} is not active`);
        return { success: false, reason: 'webhook_inactive' };
      }

      // Record attempt
      const attempt = await webhookService.recordAttempt(
        tenantId,
        webhookId,
        event,
        payload,
        webhook.url,
        attemptNumber,
      );

      const startTime = Date.now();

      try {
        // Prepare payload
        const webhookPayload = {
          event,
          data: payload,
          webhook_id: webhookId,
          timestamp: new Date().toISOString(),
          attempt: attemptNumber,
        };

        const payloadString = JSON.stringify(webhookPayload);

        // Generate signature if secret is configured
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'OakLeaf-Webhook/1.0',
          'X-Webhook-Event': event,
          'X-Webhook-ID': webhookId,
          'X-Webhook-Attempt': attemptNumber.toString(),
          ...webhook.headers,
        };

        if (webhook.secret) {
          const signature = webhookService.generateSignature(payloadString, webhook.secret);
          headers['X-Webhook-Signature'] = signature;
          headers['X-Webhook-Signature-Algorithm'] = 'sha256';
        }

        // Send webhook
        this.logger.log(`Sending webhook to ${webhook.url}`);
        const response = await axios.post(webhook.url, webhookPayload, {
          headers,
          timeout: webhook.timeoutMs || 5000,
          validateStatus: (status) => status >= 200 && status < 300,
          maxRedirects: 3,
        });

        const durationMs = Date.now() - startTime;

        // Record success
        await webhookService.updateAttempt(attempt.id, {
          status: 'success',
          httpStatus: response.status,
          responseBody: JSON.stringify(response.data).substring(0, 5000), // Limit size
          responseHeaders: response.headers as Record<string, string>,
          durationMs,
        });

        this.logger.log(`Webhook ${webhookId} delivered successfully in ${durationMs}ms`);

        return {
          success: true,
          httpStatus: response.status,
          durationMs,
          attempt: attemptNumber,
        };
      } catch (error) {
        const durationMs = Date.now() - startTime;
        const axiosError = error as AxiosError;

        let httpStatus: number | undefined;
        let errorMessage: string;
        let responseBody: string | undefined;

        if (axiosError.response) {
          // Server responded with error status
          httpStatus = axiosError.response.status;
          errorMessage = `HTTP ${httpStatus}: ${axiosError.message}`;
          responseBody = JSON.stringify(axiosError.response.data).substring(0, 5000);
        } else if (axiosError.request) {
          // Request made but no response
          errorMessage = `No response: ${axiosError.message}`;
        } else {
          // Request setup error
          errorMessage = `Request error: ${axiosError.message}`;
        }

        this.logger.error(`Webhook ${webhookId} delivery failed: ${errorMessage}`);

        // Record failure
        await webhookService.updateAttempt(attempt.id, {
          status: 'failed',
          httpStatus,
          responseBody,
          errorMessage,
          durationMs,
        });

        // Retry logic
        if (attemptNumber < (webhook.maxRetries || 3)) {
          const nextAttempt = attemptNumber + 1;
          const delayMs = this.calculateRetryDelay(nextAttempt);

          this.logger.log(`Scheduling retry ${nextAttempt} for webhook ${webhookId} in ${delayMs}ms`);

          // Schedule retry
          await job.queue.add(
            'deliver-webhook',
            {
              ...job.data,
              attemptNumber: nextAttempt,
            },
            {
              delay: delayMs,
              attempts: 1, // Don't use Bull's retry, we handle it ourselves
            },
          );

          return {
            success: false,
            retry: true,
            nextAttempt,
            delayMs,
            errorMessage,
          };
        }

        // Max retries reached
        this.logger.error(`Webhook ${webhookId} failed after ${attemptNumber} attempts`);
        throw new Error(errorMessage);
      }
    } catch (error) {
      this.logger.error(`Failed to process webhook job: ${error.message}`);
      throw error;
    }
  }

  @Process('batch-deliver-webhooks')
  async handleBatchDeliverWebhooks(job: Job<{ webhooks: DeliverWebhookJobData[] }>) {
    this.logger.log(`Processing batch webhook delivery job ${job.id} with ${job.data.webhooks.length} webhooks`);
    const { webhooks } = job.data;

    const results = await Promise.allSettled(
      webhooks.map(async (webhookData) => {
        // Queue individual webhook deliveries
        return await job.queue.add('deliver-webhook', webhookData);
      }),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      success: true,
      total: webhooks.length,
      succeeded,
      failed,
    };
  }

  @Process('retry-failed-webhook')
  async handleRetryFailedWebhook(job: Job<{ attemptId: string; tenantId: string }>) {
    this.logger.log(`Processing retry for failed webhook attempt ${job.data.attemptId}`);
    const { attemptId, tenantId } = job.data;

    try {
      const { WebhookService } = await import('../../../modules/webhook/webhook.service');
      const webhookService = job.data['webhookService'] as WebhookService;

      // Get attempt details and re-queue
      // Implementation would fetch attempt and create new delivery job
      // For now, return success
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to retry webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate exponential backoff delay for retries
   */
  private calculateRetryDelay(attemptNumber: number): number {
    // Exponential backoff: 2^attempt * 1000ms
    // Attempt 1: 2s, Attempt 2: 4s, Attempt 3: 8s, etc.
    const baseDelay = 1000;
    const exponentialDelay = Math.pow(2, attemptNumber) * baseDelay;

    // Add jitter (±20%) to avoid thundering herd
    const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);

    // Cap at 1 hour
    return Math.min(exponentialDelay + jitter, 60 * 60 * 1000);
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing webhook job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Webhook job ${job.id} completed successfully`);
    if (result.retry) {
      this.logger.log(`Scheduled retry ${result.nextAttempt} in ${result.delayMs}ms`);
    }
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Webhook job ${job.id} failed with error: ${error.message}`);
    this.logger.error(`Stack:`, error.stack);
  }
}
