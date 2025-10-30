import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Funnel } from './funnel.entity';
import { Page } from './page.entity';

export enum ConditionType {
  PAGE_TRANSITION = 'page_transition', // Control which page to go to next
  CONTENT_DISPLAY = 'content_display', // Show/hide content on a page
  REDIRECT = 'redirect', // Redirect to external URL
  ACTION_TRIGGER = 'action_trigger', // Trigger an action (email, webhook, etc.)
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  IN_LIST = 'in_list',
  NOT_IN_LIST = 'not_in_list',
  IS_EMPTY = 'is_empty',
  IS_NOT_EMPTY = 'is_not_empty',
  REGEX_MATCH = 'regex_match',
}

@Entity('funnel_conditions')
export class FunnelCondition extends TenantBaseEntity {
  @Column({ name: 'funnel_id', type: 'uuid' })
  @Index()
  funnelId: string;

  @ManyToOne(() => Funnel, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'funnel_id' })
  funnel: Funnel;

  @Column({ name: 'page_id', type: 'uuid', nullable: true })
  @Index()
  pageId?: string; // The page this condition applies to

  @ManyToOne(() => Page, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'page_id' })
  page?: Page;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ConditionType })
  type: ConditionType;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  order: number; // Execution order

  // Condition logic (all must be true for condition to pass)
  @Column({ type: 'jsonb' })
  rules: Array<{
    field: string; // e.g., 'contact.email', 'utm_source', 'cart.total', 'segment', 'tag'
    operator: ConditionOperator;
    value: any;
    fieldType?: string; // 'contact', 'session', 'cart', 'custom'
  }>;

  @Column({ type: 'varchar', length: 10, default: 'AND' })
  logicOperator: 'AND' | 'OR'; // How to combine multiple rules

  // Actions when condition is met
  @Column({ type: 'jsonb' })
  actions: Array<{
    type: string; // 'navigate_to_page', 'show_element', 'hide_element', 'redirect', 'trigger_webhook', 'send_email', etc.
    config: any; // Action-specific configuration
    order: number;
  }>;

  // Actions when condition fails (else case)
  @Column({ type: 'jsonb', default: '[]' })
  elseActions: Array<{
    type: string;
    config: any;
    order: number;
  }>;

  // Targeting (when should this condition be evaluated?)
  @Column({ type: 'jsonb', default: '{}' })
  targeting: {
    segments?: string[]; // Only evaluate for these segments
    tags?: string[]; // Only evaluate for contacts with these tags
    devices?: string[]; // Only evaluate on these devices
    trafficSources?: string[]; // Only evaluate for these traffic sources
  };

  // Analytics
  @Column({ type: 'integer', default: 0 })
  evaluationCount: number; // How many times evaluated

  @Column({ type: 'integer', default: 0 })
  passedCount: number; // How many times condition passed

  @Column({ type: 'integer', default: 0 })
  failedCount: number; // How many times condition failed

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  passRate: number; // Percentage

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
