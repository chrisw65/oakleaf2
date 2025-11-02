import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

export enum AuditAction {
  // Authentication
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET = 'password_reset',

  // CRUD Operations
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',

  // Specific Actions
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
  IMPORT = 'import',

  // Permissions
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_REVOKED = 'permission_revoked',
  ROLE_ASSIGNED = 'role_assigned',
  ROLE_REMOVED = 'role_removed',

  // Payments
  PAYMENT_PROCESSED = 'payment_processed',
  REFUND_ISSUED = 'refund_issued',
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',

  // Settings
  SETTINGS_UPDATED = 'settings_updated',
  API_KEY_CREATED = 'api_key_created',
  API_KEY_DELETED = 'api_key_deleted',
  WEBHOOK_TRIGGERED = 'webhook_triggered',
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Audit log entity for tracking all important actions in the system
 * Provides comprehensive audit trail for compliance and security
 */
@Entity('audit_logs')
@Index(['tenantId', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['resource', 'action'])
@Index(['severity'])
export class AuditLog extends TenantBaseEntity {
  @Column()
  @Index()
  userId: string; // User who performed the action

  @Column({ nullable: true })
  impersonatorId?: string; // If action was performed via impersonation

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column()
  resource: string; // e.g., 'funnel', 'user', 'order'

  @Column({ nullable: true })
  resourceId?: string; // ID of the affected resource

  @Column({ type: 'text', nullable: true })
  description?: string; // Human-readable description

  @Column({
    type: 'enum',
    enum: AuditSeverity,
    default: AuditSeverity.INFO,
  })
  severity: AuditSeverity;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    oldValues?: Record<string, any>; // Previous values (for updates)
    newValues?: Record<string, any>; // New values (for creates/updates)
    changes?: Array<{ field: string; from: any; to: any }>; // Detailed change log
    [key: string]: any;
  };

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  requestId?: string; // For correlating related actions

  @Column({ nullable: true })
  sessionId?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  method?: string; // HTTP method (GET, POST, PUT, DELETE)

  @Column({ type: 'varchar', length: 500, nullable: true })
  endpoint?: string; // API endpoint

  @Column({ type: 'int', nullable: true })
  statusCode?: number; // HTTP status code

  @Column({ type: 'int', nullable: true })
  durationMs?: number; // Request duration

  @Column({ default: false })
  isSuccess: boolean;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'text', nullable: true })
  stackTrace?: string;

  /**
   * Get a human-readable summary of the audit log
   */
  getSummary(): string {
    const user = this.userId || 'Unknown';
    const action = this.action;
    const resource = this.resource;
    const resourceId = this.resourceId ? ` (${this.resourceId})` : '';

    return `${user} ${action} ${resource}${resourceId}`;
  }

  /**
   * Check if this is a sensitive action that should be monitored
   */
  isSensitive(): boolean {
    const sensitiveActions = [
      AuditAction.DELETE,
      AuditAction.PERMISSION_GRANTED,
      AuditAction.PERMISSION_REVOKED,
      AuditAction.ROLE_ASSIGNED,
      AuditAction.PASSWORD_CHANGED,
      AuditAction.API_KEY_CREATED,
      AuditAction.API_KEY_DELETED,
    ];

    return (
      sensitiveActions.includes(this.action) ||
      this.severity === AuditSeverity.CRITICAL ||
      this.severity === AuditSeverity.ERROR
    );
  }
}
