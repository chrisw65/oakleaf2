import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Webhook } from './webhook.entity';

export enum WebhookAttemptStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  RETRYING = 'retrying',
}

@Entity('webhook_attempts')
export class WebhookAttempt extends TenantBaseEntity {
  @Column({ name: 'webhook_id', type: 'uuid' })
  @Index()
  webhookId: string;

  @ManyToOne(() => Webhook, (webhook) => webhook.attempts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'webhook_id' })
  webhook: Webhook;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  event: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'enum', enum: WebhookAttemptStatus })
  @Index()
  status: WebhookAttemptStatus;

  @Column({ type: 'integer', default: 0 })
  attemptNumber: number;

  @Column({ type: 'integer', nullable: true })
  httpStatus?: number;

  @Column({ type: 'text', nullable: true })
  responseBody?: string;

  @Column({ type: 'jsonb', nullable: true })
  responseHeaders?: Record<string, string>;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'integer', nullable: true })
  durationMs?: number; // How long the request took

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextRetryAt?: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
