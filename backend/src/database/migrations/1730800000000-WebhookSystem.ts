import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class WebhookSystem1730800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create webhooks table
    await queryRunner.createTable(
      new Table({
        name: 'webhooks',
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
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'url',
            type: 'varchar',
            length: '2048',
          },
          {
            name: 'events',
            type: 'simple-array',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'disabled', 'failed'],
            default: "'active'",
          },
          {
            name: 'secret',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'headers',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'filters',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'maxRetries',
            type: 'int',
            default: 3,
          },
          {
            name: 'timeoutMs',
            type: 'int',
            default: 5000,
          },
          {
            name: 'verifySSL',
            type: 'boolean',
            default: true,
          },
          {
            name: 'totalAttempts',
            type: 'int',
            default: 0,
          },
          {
            name: 'successfulAttempts',
            type: 'int',
            default: 0,
          },
          {
            name: 'failedAttempts',
            type: 'int',
            default: 0,
          },
          {
            name: 'consecutiveFailures',
            type: 'int',
            default: 0,
          },
          {
            name: 'lastTriggeredAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'lastSuccessAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'lastFailureAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdBy',
            type: 'uuid',
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

    // Create webhook_attempts table
    await queryRunner.createTable(
      new Table({
        name: 'webhook_attempts',
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
            name: 'webhookId',
            type: 'uuid',
          },
          {
            name: 'event',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'payload',
            type: 'jsonb',
          },
          {
            name: 'url',
            type: 'varchar',
            length: '2048',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'success', 'failed'],
            default: "'pending'",
          },
          {
            name: 'attemptNumber',
            type: 'int',
            default: 1,
          },
          {
            name: 'httpStatus',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'responseBody',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'responseHeaders',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'durationMs',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'nextRetryAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completedAt',
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
        ],
      }),
      true,
    );

    // Create indexes for webhooks
    await queryRunner.createIndex(
      'webhooks',
      new TableIndex({
        name: 'IDX_webhook_tenant',
        columnNames: ['tenantId'],
      }),
    );

    await queryRunner.createIndex(
      'webhooks',
      new TableIndex({
        name: 'IDX_webhook_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'webhooks',
      new TableIndex({
        name: 'IDX_webhook_events',
        columnNames: ['events'],
      }),
    );

    await queryRunner.createIndex(
      'webhooks',
      new TableIndex({
        name: 'IDX_webhook_tenant_status',
        columnNames: ['tenantId', 'status'],
      }),
    );

    // Create indexes for webhook_attempts
    await queryRunner.createIndex(
      'webhook_attempts',
      new TableIndex({
        name: 'IDX_webhook_attempt_webhook',
        columnNames: ['webhookId'],
      }),
    );

    await queryRunner.createIndex(
      'webhook_attempts',
      new TableIndex({
        name: 'IDX_webhook_attempt_tenant',
        columnNames: ['tenantId'],
      }),
    );

    await queryRunner.createIndex(
      'webhook_attempts',
      new TableIndex({
        name: 'IDX_webhook_attempt_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'webhook_attempts',
      new TableIndex({
        name: 'IDX_webhook_attempt_created',
        columnNames: ['createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'webhook_attempts',
      new TableIndex({
        name: 'IDX_webhook_attempt_next_retry',
        columnNames: ['nextRetryAt'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'webhooks',
      new TableForeignKey({
        name: 'FK_webhook_tenant',
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'webhooks',
      new TableForeignKey({
        name: 'FK_webhook_created_by',
        columnNames: ['createdBy'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'webhook_attempts',
      new TableForeignKey({
        name: 'FK_webhook_attempt_webhook',
        columnNames: ['webhookId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'webhooks',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'webhook_attempts',
      new TableForeignKey({
        name: 'FK_webhook_attempt_tenant',
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('webhook_attempts', 'FK_webhook_attempt_tenant');
    await queryRunner.dropForeignKey('webhook_attempts', 'FK_webhook_attempt_webhook');
    await queryRunner.dropForeignKey('webhooks', 'FK_webhook_created_by');
    await queryRunner.dropForeignKey('webhooks', 'FK_webhook_tenant');

    // Drop indexes
    await queryRunner.dropIndex('webhook_attempts', 'IDX_webhook_attempt_next_retry');
    await queryRunner.dropIndex('webhook_attempts', 'IDX_webhook_attempt_created');
    await queryRunner.dropIndex('webhook_attempts', 'IDX_webhook_attempt_status');
    await queryRunner.dropIndex('webhook_attempts', 'IDX_webhook_attempt_tenant');
    await queryRunner.dropIndex('webhook_attempts', 'IDX_webhook_attempt_webhook');
    await queryRunner.dropIndex('webhooks', 'IDX_webhook_tenant_status');
    await queryRunner.dropIndex('webhooks', 'IDX_webhook_events');
    await queryRunner.dropIndex('webhooks', 'IDX_webhook_status');
    await queryRunner.dropIndex('webhooks', 'IDX_webhook_tenant');

    // Drop tables
    await queryRunner.dropTable('webhook_attempts');
    await queryRunner.dropTable('webhooks');
  }
}
