import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

export interface FilterCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan' | 'between' | 'in' | 'notIn' | 'isNull' | 'isNotNull';
  value?: any;
  values?: any[];
}

export interface FilterGroup {
  logic: 'AND' | 'OR';
  conditions: FilterCondition[];
  groups?: FilterGroup[];
}

@Entity('saved_filters')
export class SavedFilter extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  entityType: string; // 'contact', 'opportunity', 'task', etc.

  @Column({ type: 'jsonb' })
  filterConfig: FilterGroup;

  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic: boolean; // If true, visible to all users in tenant

  @Column({ name: 'created_by_id', type: 'uuid' })
  @Index()
  createdById: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean; // If true, applied by default when viewing entity list
}
