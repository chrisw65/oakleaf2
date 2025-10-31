import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { Webhook } from './webhook.entity';
import { WebhookAttempt } from './webhook-attempt.entity';
import { QueueModule } from '../../common/queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Webhook, WebhookAttempt]),
    QueueModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}
