import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class ABTesting1731800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ab_tests table
    await queryRunner.createTable(
      new Table({
        name: 'ab_tests',
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
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['page', 'funnel', 'email', 'headline', 'cta', 'pricing', 'custom'],
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'running', 'paused', 'completed', 'archived'],
            default: "'draft'",
          },
          {
            name: 'resourceType',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'resourceId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'variants',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'trafficAllocation',
            type: 'int',
            default: 100,
          },
          {
            name: 'goalMetric',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'targetImprovement',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'confidenceLevel',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 95,
          },
          {
            name: 'startedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'endedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'minSampleSize',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'maxDuration',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'winnerId',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'winnerSelectionMethod',
            type: 'enum',
            enum: ['manual', 'conversions', 'revenue', 'engagement'],
            default: "'manual'",
          },
          {
            name: 'winnerSelectedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'results',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
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

    // Create ab_test_participants table
    await queryRunner.createTable(
      new Table({
        name: 'ab_test_participants',
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
            isNullable: false,
          },
          {
            name: 'testId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'variantId',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'sessionId',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'assignedAt',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'converted',
            type: 'boolean',
            default: false,
          },
          {
            name: 'convertedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'conversionValue',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'interactions',
            type: 'int',
            default: 0,
          },
          {
            name: 'timeSpent',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'events',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'deviceType',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'browser',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'referrer',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
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

    // Create indexes for ab_tests
    await queryRunner.createIndex(
      'ab_tests',
      new TableIndex({
        name: 'IDX_ab_tests_tenant_status',
        columnNames: ['tenantId', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'ab_tests',
      new TableIndex({
        name: 'IDX_ab_tests_resource',
        columnNames: ['resourceType', 'resourceId'],
      }),
    );

    await queryRunner.createIndex(
      'ab_tests',
      new TableIndex({
        name: 'IDX_ab_tests_created_by',
        columnNames: ['createdBy'],
      }),
    );

    // Create indexes for ab_test_participants
    await queryRunner.createIndex(
      'ab_test_participants',
      new TableIndex({
        name: 'IDX_ab_participants_tenant_test_user',
        columnNames: ['tenantId', 'testId', 'userId'],
      }),
    );

    await queryRunner.createIndex(
      'ab_test_participants',
      new TableIndex({
        name: 'IDX_ab_participants_test_variant',
        columnNames: ['testId', 'variantId'],
      }),
    );

    await queryRunner.createIndex(
      'ab_test_participants',
      new TableIndex({
        name: 'IDX_ab_participants_session',
        columnNames: ['sessionId'],
      }),
    );

    await queryRunner.createIndex(
      'ab_test_participants',
      new TableIndex({
        name: 'IDX_ab_participants_converted',
        columnNames: ['converted'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'ab_tests',
      new TableForeignKey({
        name: 'FK_ab_tests_tenant',
        columnNames: ['tenantId'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'ab_test_participants',
      new TableForeignKey({
        name: 'FK_ab_participants_tenant',
        columnNames: ['tenantId'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'ab_test_participants',
      new TableForeignKey({
        name: 'FK_ab_participants_test',
        columnNames: ['testId'],
        referencedTableName: 'ab_tests',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('ab_test_participants', 'FK_ab_participants_test');
    await queryRunner.dropForeignKey('ab_test_participants', 'FK_ab_participants_tenant');
    await queryRunner.dropForeignKey('ab_tests', 'FK_ab_tests_tenant');

    // Drop indexes for ab_test_participants
    await queryRunner.dropIndex('ab_test_participants', 'IDX_ab_participants_converted');
    await queryRunner.dropIndex('ab_test_participants', 'IDX_ab_participants_session');
    await queryRunner.dropIndex('ab_test_participants', 'IDX_ab_participants_test_variant');
    await queryRunner.dropIndex('ab_test_participants', 'IDX_ab_participants_tenant_test_user');

    // Drop indexes for ab_tests
    await queryRunner.dropIndex('ab_tests', 'IDX_ab_tests_created_by');
    await queryRunner.dropIndex('ab_tests', 'IDX_ab_tests_resource');
    await queryRunner.dropIndex('ab_tests', 'IDX_ab_tests_tenant_status');

    // Drop tables
    await queryRunner.dropTable('ab_test_participants');
    await queryRunner.dropTable('ab_tests');
  }
}
