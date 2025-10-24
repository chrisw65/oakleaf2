import { Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

/**
 * Base entity for all tenant-scoped entities
 * Ensures multi-tenancy isolation
 */
export abstract class TenantBaseEntity extends BaseEntity {
  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;
}
