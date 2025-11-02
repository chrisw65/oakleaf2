import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

export enum DomainStatus {
  PENDING = 'pending',
  VERIFYING = 'verifying',
  VERIFIED = 'verified',
  FAILED = 'failed',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export enum DomainType {
  TENANT = 'tenant',
  FUNNEL = 'funnel',
  PAGE = 'page',
}

/**
 * Custom Domain entity for managing custom domains
 * Handles DNS verification, SSL certificates, and domain status
 */
@Entity('custom_domains')
@Index(['domain'], { unique: true })
@Index(['tenantId', 'status'])
export class CustomDomain extends TenantBaseEntity {
  @Column({ unique: true })
  domain: string; // e.g., shop.example.com

  @Column({
    type: 'enum',
    enum: DomainType,
    default: DomainType.TENANT,
  })
  type: DomainType;

  @Column({ nullable: true })
  resourceId?: string; // Funnel ID or Page ID if type is not TENANT

  @Column({
    type: 'enum',
    enum: DomainStatus,
    default: DomainStatus.PENDING,
  })
  status: DomainStatus;

  @Column({ nullable: true })
  verificationToken?: string; // Token for DNS verification

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastCheckedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  dnsRecords?: {
    required: Array<{
      type: 'A' | 'CNAME' | 'TXT';
      name: string;
      value: string;
      status?: 'found' | 'missing' | 'incorrect';
    }>;
    detected?: Array<{
      type: string;
      name: string;
      value: string;
    }>;
  };

  @Column({ default: false })
  sslEnabled: boolean;

  @Column({ nullable: true })
  sslProvider?: string; // e.g., 'letsencrypt', 'cloudflare'

  @Column({ type: 'timestamp', nullable: true })
  sslIssuedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  sslExpiresAt?: Date;

  @Column({ type: 'text', nullable: true })
  sslCertificate?: string; // Path or identifier

  @Column({ default: false })
  autoRenewSsl: boolean;

  @Column({ type: 'jsonb', nullable: true })
  redirects?: {
    from?: string; // Redirect from www to non-www or vice versa
    to?: string;
    type?: 301 | 302;
  };

  @Column({ type: 'text', nullable: true })
  errorMessage?: string; // Last error during verification

  @Column({ default: 0 })
  verificationAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lastVerificationAttempt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  /**
   * Check if domain is active
   */
  isActive(): boolean {
    return this.status === DomainStatus.ACTIVE;
  }

  /**
   * Check if domain is verified
   */
  isVerified(): boolean {
    return this.status === DomainStatus.VERIFIED || this.status === DomainStatus.ACTIVE;
  }

  /**
   * Check if SSL needs renewal
   */
  sslNeedsRenewal(): boolean {
    if (!this.sslExpiresAt) {
      return false;
    }

    const daysUntilExpiry = Math.ceil(
      (this.sslExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

    return daysUntilExpiry <= 30; // Renew 30 days before expiry
  }

  /**
   * Get days until SSL expiry
   */
  getDaysUntilSslExpiry(): number | null {
    if (!this.sslExpiresAt) {
      return null;
    }

    return Math.ceil((this.sslExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }
}
