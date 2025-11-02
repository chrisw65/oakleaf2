import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class AuditLogging1731000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create audit_logs table
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
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
            name: 'impersonatorId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'action',
            type: 'enum',
            enum: [
              'login',
              'logout',
              'login_failed',
              'password_changed',
              'password_reset',
              'create',
              'read',
              'update',
              'delete',
              'publish',
              'unpublish',
              'approve',
              'reject',
              'export',
              'import',
              'permission_granted',
              'permission_revoked',
              'role_assigned',
              'role_removed',
              'payment_processed',
              'refund_issued',
              'subscription_created',
              'subscription_cancelled',
              'settings_updated',
              'api_key_created',
              'api_key_deleted',
              'webhook_triggered',
            ],
          },
          {
            name: 'resource',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'resourceId',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'severity',
            type: 'enum',
            enum: ['info', 'warning', 'error', 'critical'],
            default: "'info'",
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'userAgent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'requestId',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'sessionId',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'method',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'endpoint',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'statusCode',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'durationMs',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'isSuccess',
            type: 'boolean',
            default: false,
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'stackTrace',
            type: 'text',
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

    // Create indexes for efficient querying
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_tenant_created',
        columnNames: ['tenantId', 'createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_user',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_user_created',
        columnNames: ['userId', 'createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_resource',
        columnNames: ['resource'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_resource_action',
        columnNames: ['resource', 'action'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_resource_id',
        columnNames: ['resourceId'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_severity',
        columnNames: ['severity'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_action',
        columnNames: ['action'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_created',
        columnNames: ['createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_request_id',
        columnNames: ['requestId'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        name: 'FK_audit_tenant',
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        name: 'FK_audit_user',
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create partial index for failed actions (for monitoring)
    await queryRunner.query(`
      CREATE INDEX IDX_audit_failed ON audit_logs (tenantId, createdAt)
      WHERE isSuccess = false OR severity IN ('error', 'critical')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop partial index
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_audit_failed`);

    // Drop foreign keys
    await queryRunner.dropForeignKey('audit_logs', 'FK_audit_user');
    await queryRunner.dropForeignKey('audit_logs', 'FK_audit_tenant');

    // Drop indexes
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_request_id');
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_created');
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_action');
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_severity');
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_resource_id');
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_resource_action');
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_resource');
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_user_created');
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_user');
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_tenant_created');

    // Drop table
    await queryRunner.dropTable('audit_logs');
  }
}
