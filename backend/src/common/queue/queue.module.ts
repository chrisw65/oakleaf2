import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { EmailQueue } from './processors/email.processor';
import { DataProcessingQueue } from './processors/data-processing.processor';
import { WebhookQueue } from './processors/webhook.processor';
import { NotificationQueue } from './processors/notification.processor';

export enum QueueName {
  EMAIL = 'email',
  DATA_PROCESSING = 'data-processing',
  WEBHOOK = 'webhook',
  NOTIFICATION = 'notification',
  ANALYTICS = 'analytics',
  REPORT = 'report',
}

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 500, // Keep last 500 failed jobs
        },
      }),
      inject: [ConfigService],
    }),
    // Register all queues
    BullModule.registerQueue(
      { name: QueueName.EMAIL },
      { name: QueueName.DATA_PROCESSING },
      { name: QueueName.WEBHOOK },
      { name: QueueName.NOTIFICATION },
      { name: QueueName.ANALYTICS },
      { name: QueueName.REPORT },
    ),
  ],
  providers: [
    QueueService,
    EmailQueue,
    DataProcessingQueue,
    WebhookQueue,
    NotificationQueue,
  ],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
