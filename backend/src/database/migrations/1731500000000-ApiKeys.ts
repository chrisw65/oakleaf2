import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class ApiKeys1731500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create api_keys table
    await queryRunner.createTable(
      new Table({
        name: 'api_keys',
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
            name: 'key',
            type: 'varchar',
            length: '64',
            isUnique: true,
          },
          {
            name: 'prefix',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'createdBy',
            type: 'uuid',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'revoked', 'expired'],
            default: "'active'",
          },
          {
            name: 'permissions',
            type: 'simple-array',
            isNullable: true,
          },
          {
            name: 'allowedIps',
            type: 'simple-array',
            isNullable: true,
          },
          {
            name: 'rateLimit',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'lastUsedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'usageCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'revokedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'revokedBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'revokedReason',
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

    // Create indexes
    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'IDX_api_key_tenant_status',
        columnNames: ['tenantId', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'IDX_api_key_key',
        columnNames: ['key'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'IDX_api_key_prefix',
        columnNames: ['prefix'],
      }),
    );

    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'IDX_api_key_expires',
        columnNames: ['expiresAt'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'api_keys',
      new TableForeignKey({
        name: 'FK_api_key_tenant',
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'api_keys',
      new TableForeignKey({
        name: 'FK_api_key_created_by',
        columnNames: ['createdBy'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('api_keys', 'FK_api_key_created_by');
    await queryRunner.dropForeignKey('api_keys', 'FK_api_key_tenant');

    // Drop indexes
    await queryRunner.dropIndex('api_keys', 'IDX_api_key_expires');
    await queryRunner.dropIndex('api_keys', 'IDX_api_key_prefix');
    await queryRunner.dropIndex('api_keys', 'IDX_api_key_key');
    await queryRunner.dropIndex('api_keys', 'IDX_api_key_tenant_status');

    // Drop table
    await queryRunner.dropTable('api_keys');
  }
}
