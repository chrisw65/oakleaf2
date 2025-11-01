import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class TwoFactorAuth1731400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create two_factor_auth table
    await queryRunner.createTable(
      new Table({
        name: 'two_factor_auth',
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
            name: 'secret',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'isEnabled',
            type: 'boolean',
            default: false,
          },
          {
            name: 'enabledAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'backupCodes',
            type: 'simple-array',
            isNullable: true,
          },
          {
            name: 'backupCodesUsed',
            type: 'int',
            default: 0,
          },
          {
            name: 'lastUsedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'failedAttempts',
            type: 'int',
            default: 0,
          },
          {
            name: 'lockedUntil',
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

    // Create unique index on userId
    await queryRunner.createIndex(
      'two_factor_auth',
      new TableIndex({
        name: 'IDX_2fa_user',
        columnNames: ['userId'],
        isUnique: true,
      }),
    );

    // Create index on tenantId
    await queryRunner.createIndex(
      'two_factor_auth',
      new TableIndex({
        name: 'IDX_2fa_tenant',
        columnNames: ['tenantId'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'two_factor_auth',
      new TableForeignKey({
        name: 'FK_2fa_tenant',
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'two_factor_auth',
      new TableForeignKey({
        name: 'FK_2fa_user',
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('two_factor_auth', 'FK_2fa_user');
    await queryRunner.dropForeignKey('two_factor_auth', 'FK_2fa_tenant');

    // Drop indexes
    await queryRunner.dropIndex('two_factor_auth', 'IDX_2fa_tenant');
    await queryRunner.dropIndex('two_factor_auth', 'IDX_2fa_user');

    // Drop table
    await queryRunner.dropTable('two_factor_auth');
  }
}
