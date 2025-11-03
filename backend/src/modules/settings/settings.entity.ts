import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('platform_settings')
@Index(['tenantId', 'key'], { unique: true })
export class PlatformSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  @Column({ length: 100 })
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_encrypted', default: false })
  isEncrypted: boolean;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Common setting keys
export enum SettingKey {
  OPENAI_API_KEY = 'openai_api_key',
  OPENAI_ENABLED = 'openai_enabled',
  STRIPE_SECRET_KEY = 'stripe_secret_key',
  STRIPE_PUBLISHABLE_KEY = 'stripe_publishable_key',
  SMTP_HOST = 'smtp_host',
  SMTP_PORT = 'smtp_port',
  SMTP_USER = 'smtp_user',
  SMTP_PASSWORD = 'smtp_password',
  S3_ACCESS_KEY = 's3_access_key',
  S3_SECRET_KEY = 's3_secret_key',
  S3_BUCKET = 's3_bucket',
  S3_REGION = 's3_region',
}
