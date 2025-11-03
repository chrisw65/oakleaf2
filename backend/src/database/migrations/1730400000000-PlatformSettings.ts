import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class PlatformSettings1730400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'platform_settings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'tenant_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'key',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'value',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_encrypted',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_enabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create index on tenant_id
    await queryRunner.createIndex(
      'platform_settings',
      new TableIndex({
        name: 'IDX_platform_settings_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );

    // Create unique index on tenant_id + key combination
    await queryRunner.createIndex(
      'platform_settings',
      new TableIndex({
        name: 'IDX_platform_settings_tenant_key',
        columnNames: ['tenant_id', 'key'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('platform_settings', 'IDX_platform_settings_tenant_key');
    await queryRunner.dropIndex('platform_settings', 'IDX_platform_settings_tenant_id');
    await queryRunner.dropTable('platform_settings');
  }
}
