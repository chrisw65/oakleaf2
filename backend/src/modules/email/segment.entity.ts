import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { User } from '../user/user.entity';

export enum SegmentType {
  STATIC = 'static', // Manually added contacts
  DYNAMIC = 'dynamic', // Auto-updated based on conditions
}

export enum SegmentStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Entity('segments')
export class Segment extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: SegmentType, default: SegmentType.DYNAMIC })
  type: SegmentType;

  @Column({ type: 'enum', enum: SegmentStatus, default: SegmentStatus.ACTIVE })
  @Index()
  status: SegmentStatus;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  // Conditions (for dynamic segments)
  @Column({ type: 'jsonb', default: '{}' })
  conditions: {
    matchType?: 'all' | 'any'; // Match all conditions or any condition

    // Contact filters
    tags?: {
      operator: 'has_all' | 'has_any' | 'has_none';
      tagIds: string[];
    };

    customFields?: Array<{
      fieldId: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
      value?: any;
    }>;

    // Contact properties
    email?: {
      operator: 'contains' | 'not_contains' | 'ends_with' | 'starts_with';
      value: string;
    };

    leadScore?: {
      operator: 'greater_than' | 'less_than' | 'equals' | 'between';
      value: number | [number, number];
    };

    lifetimeValue?: {
      operator: 'greater_than' | 'less_than' | 'equals' | 'between';
      value: number | [number, number];
    };

    // Behavioral filters
    emailEngagement?: {
      campaignIds?: string[];
      sequenceIds?: string[];
      opened?: boolean;
      clicked?: boolean;
      minOpenRate?: number;
      minClickRate?: number;
      lastEngagedDays?: number; // Engaged in last X days
    };

    // Purchase behavior
    hasPurchased?: boolean;
    purchasedProducts?: string[];
    totalOrders?: {
      operator: 'greater_than' | 'less_than' | 'equals';
      value: number;
    };
    totalSpent?: {
      operator: 'greater_than' | 'less_than' | 'equals' | 'between';
      value: number | [number, number];
    };
    lastPurchaseDays?: number; // Purchased in last X days

    // Cart behavior
    hasAbandonedCart?: boolean;
    cartValue?: {
      operator: 'greater_than' | 'less_than' | 'equals';
      value: number;
    };

    // Date filters
    createdAt?: {
      operator: 'after' | 'before' | 'between' | 'last_days';
      value: string | [string, string] | number;
    };

    // Opportunity filters
    hasOpportunity?: boolean;
    opportunityStatus?: string[];
    opportunityValue?: {
      operator: 'greater_than' | 'less_than' | 'equals';
      value: number;
    };

    // Page visits
    visitedPages?: {
      urls: string[];
      operator: 'any' | 'all';
    };

    // Location filters
    country?: string[];
    state?: string[];
    city?: string[];
  };

  // Static segment contacts (only for type = 'static')
  @Column({ type: 'jsonb', default: '[]' })
  contactIds: string[];

  // Statistics
  @Column({ type: 'integer', default: 0 })
  contactCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastCalculatedAt?: Date; // When contact count was last updated

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
