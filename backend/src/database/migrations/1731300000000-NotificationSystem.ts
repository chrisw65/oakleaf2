import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class NotificationSystem1731300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create notifications table
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenantId',
            type: 'uuid',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'type',
            type: 'enum',
            enum: [
              'system',
              'order_created',
              'order_completed',
              'payment_succeeded',
              'payment_failed',
              'refund_issued',
              'subscription_created',
              'subscription_renewed',
              'subscription_canceled',
              'subscription_payment_failed',
              'contact_created',
              'contact_updated',
              'form_submitted',
              'email_sent',
              'email_opened',
              'email_clicked',
              'email_bounced',
              'affiliate_joined',
              'commission_earned',
              'commission_paid',
              'webhook_failed',
              'file_uploaded',
              'file_processed',
              'user_invited',
              'user_joined',
              'role_changed',
            ],
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['low', 'normal', 'high', 'urgent'],
            default: "'normal'",
          },
          {
            name: 'isRead',
            type: 'boolean',
            default: false,
          },
          {
            name: 'readAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'actionUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'actionLabel',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'icon',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'color',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'data',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'groupKey',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'isSent',
            type: 'boolean',
            default: false,
          },
          {
            name: 'sentAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_notification_tenant_user_read',
        columnNames: ['tenantId', 'userId', 'isRead'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_notification_type',
        columnNames: ['type'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_notification_user',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_notification_created',
        columnNames: ['createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_notification_group',
        columnNames: ['groupKey'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_notification_expires',
        columnNames: ['expiresAt'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        name: 'FK_notification_tenant',
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        name: 'FK_notification_user',
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create partial index for unread notifications (performance)
    await queryRunner.query(`
      CREATE INDEX IDX_notification_unread ON notifications (tenantId, userId, createdAt)
      WHERE isRead = false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop partial index
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_notification_unread`);

    // Drop foreign keys
    await queryRunner.dropForeignKey('notifications', 'FK_notification_user');
    await queryRunner.dropForeignKey('notifications', 'FK_notification_tenant');

    // Drop indexes
    await queryRunner.dropIndex('notifications', 'IDX_notification_expires');
    await queryRunner.dropIndex('notifications', 'IDX_notification_group');
    await queryRunner.dropIndex('notifications', 'IDX_notification_created');
    await queryRunner.dropIndex('notifications', 'IDX_notification_user');
    await queryRunner.dropIndex('notifications', 'IDX_notification_type');
    await queryRunner.dropIndex('notifications', 'IDX_notification_tenant_user_read');

    // Drop table
    await queryRunner.dropTable('notifications');
  }
}
