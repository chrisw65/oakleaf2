import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

export enum ApiKeyStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

/**
 * API Key entity for third-party integrations
 * Allows external systems to authenticate
 */
@Entity('api_keys')
@Index(['tenantId', 'status'])
@Index(['key'], { unique: true })
export class ApiKey extends TenantBaseEntity {
  @Column()
  name: string; // Descriptive name for the key

  @Column({ unique: true })
  key: string; // The actual API key (hashed)

  @Column()
  prefix: string; // First 8 chars for identification (e.g., "ak_live_")

  @Column()
  createdBy: string; // User ID who created the key

  @Column({
    type: 'enum',
    enum: ApiKeyStatus,
    default: ApiKeyStatus.ACTIVE,
  })
  status: ApiKeyStatus;

  @Column({ type: 'simple-array', nullable: true })
  permissions?: string[]; // Specific permissions for this key

  @Column({ type: 'simple-array', nullable: true })
  allowedIps?: string[]; // IP whitelist

  @Column({ type: 'jsonb', nullable: true })
  rateLimit?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt?: Date;

  @Column({ nullable: true })
  revokedBy?: string;

  @Column({ type: 'text', nullable: true })
  revokedReason?: string;

  /**
   * Check if key is active and valid
   */
  isValid(): boolean {
    if (this.status !== ApiKeyStatus.ACTIVE) {
      return false;
    }

    if (this.expiresAt && new Date() > this.expiresAt) {
      return false;
    }

    return true;
  }

  /**
   * Check if key is expired
   */
  isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return new Date() > this.expiresAt;
  }

  /**
   * Check if IP is allowed
   */
  isIpAllowed(ip: string): boolean {
    if (!this.allowedIps || this.allowedIps.length === 0) {
      return true; // No IP restriction
    }

    return this.allowedIps.includes(ip);
  }

  /**
   * Increment usage count
   */
  incrementUsage(): void {
    this.usageCount += 1;
    this.lastUsedAt = new Date();
  }

  /**
   * Revoke the key
   */
  revoke(userId: string, reason?: string): void {
    this.status = ApiKeyStatus.REVOKED;
    this.revokedAt = new Date();
    this.revokedBy = userId;
    this.revokedReason = reason;
  }
}
