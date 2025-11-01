import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { QueueName } from '../queue.constants';

export interface SendEmailJobData {
  to: string | string[];
  subject: string;
  template?: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
  }>;
  templateData?: Record<string, any>;
}

export interface BulkEmailJobData {
  recipients: Array<{
    email: string;
    data?: Record<string, any>;
  }>;
  subject: string;
  template: string;
  from?: string;
}

@Processor(QueueName.EMAIL)
export class EmailQueue {
  private readonly logger = new Logger(EmailQueue.name);

  @Process('send-email')
  async handleSendEmail(job: Job<SendEmailJobData>) {
    this.logger.log(`Processing email job ${job.id}`);
    const { to, subject, template, html, text, from, cc, bcc, attachments, templateData } = job.data;

    try {
      // TODO: Implement actual email sending logic
      // This would integrate with your email service (SendGrid, SES, etc.)
      this.logger.log(`Sending email to: ${to}`);
      this.logger.log(`Subject: ${subject}`);

      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        messageId: `msg-${Date.now()}`,
        to,
        subject,
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  @Process('send-bulk-email')
  async handleBulkEmail(job: Job<BulkEmailJobData>) {
    this.logger.log(`Processing bulk email job ${job.id} for ${job.data.recipients.length} recipients`);
    const { recipients, subject, template, from } = job.data;

    try {
      const results = [];

      // Process in batches of 50
      const batchSize = 50;
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);

        const batchResults = await Promise.allSettled(
          batch.map(async (recipient) => {
            // TODO: Implement actual email sending
            this.logger.log(`Sending email to: ${recipient.email}`);
            await new Promise((resolve) => setTimeout(resolve, 100));
            return { email: recipient.email, sent: true };
          })
        );

        results.push(...batchResults);

        // Update progress
        const progress = Math.round(((i + batch.length) / recipients.length) * 100);
        await job.progress(progress);
      }

      const sent = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return {
        success: true,
        sent,
        failed,
        total: recipients.length,
      };
    } catch (error) {
      this.logger.error(`Failed to send bulk email: ${error.message}`);
      throw error;
    }
  }

  @Process('send-template-email')
  async handleTemplateEmail(job: Job<SendEmailJobData>) {
    this.logger.log(`Processing template email job ${job.id}`);
    const { to, subject, template, templateData, from } = job.data;

    try {
      // TODO: Load and render email template
      this.logger.log(`Rendering template: ${template}`);
      this.logger.log(`Template data:`, templateData);

      // TODO: Send rendered email
      this.logger.log(`Sending template email to: ${to}`);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        messageId: `msg-${Date.now()}`,
        to,
        template,
      };
    } catch (error) {
      this.logger.error(`Failed to send template email: ${error.message}`);
      throw error;
    }
  }

  @Process('send-transactional-email')
  async handleTransactionalEmail(job: Job<SendEmailJobData>) {
    this.logger.log(`Processing transactional email job ${job.id}`);

    try {
      // Transactional emails have higher priority and should be sent immediately
      const { to, subject, html, text, from } = job.data;

      this.logger.log(`Sending transactional email to: ${to}`);

      // TODO: Implement actual sending
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        success: true,
        messageId: `txn-${Date.now()}`,
        to,
        subject,
      };
    } catch (error) {
      this.logger.error(`Failed to send transactional email: ${error.message}`);
      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed successfully`);
    this.logger.debug(`Result:`, result);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed with error: ${error.message}`);
    this.logger.error(`Stack:`, error.stack);
  }
}
