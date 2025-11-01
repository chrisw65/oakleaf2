import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CustomDomains1731600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create custom_domains table
    await queryRunner.createTable(
      new Table({
        name: 'custom_domains',
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
            name: 'domain',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['tenant', 'funnel', 'page'],
            default: "'tenant'",
          },
          {
            name: 'resourceId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'verifying', 'verified', 'failed', 'active', 'suspended'],
            default: "'pending'",
          },
          {
            name: 'verificationToken',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'verifiedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'lastCheckedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'dnsRecords',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'sslEnabled',
            type: 'boolean',
            default: false,
          },
          {
            name: 'sslProvider',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'sslIssuedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'sslExpiresAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'sslCertificate',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'autoRenewSsl',
            type: 'boolean',
            default: false,
          },
          {
            name: 'redirects',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'verificationAttempts',
            type: 'int',
            default: 0,
          },
          {
            name: 'lastVerificationAttempt',
            type: 'timestamp',
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

    // Create indexes
    await queryRunner.createIndex(
      'custom_domains',
      new TableIndex({
        name: 'IDX_custom_domains_domain',
        columnNames: ['domain'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'custom_domains',
      new TableIndex({
        name: 'IDX_custom_domains_tenant_status',
        columnNames: ['tenantId', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'custom_domains',
      new TableIndex({
        name: 'IDX_custom_domains_type_resource',
        columnNames: ['type', 'resourceId'],
      }),
    );

    await queryRunner.createIndex(
      'custom_domains',
      new TableIndex({
        name: 'IDX_custom_domains_ssl_expiry',
        columnNames: ['sslExpiresAt'],
        where: 'sslEnabled = true',
      }),
    );

    // Create foreign key for tenantId
    await queryRunner.createForeignKey(
      'custom_domains',
      new TableForeignKey({
        name: 'FK_custom_domains_tenant',
        columnNames: ['tenantId'],
        referencedTableName: 'tenants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.dropForeignKey('custom_domains', 'FK_custom_domains_tenant');

    // Drop indexes
    await queryRunner.dropIndex('custom_domains', 'IDX_custom_domains_ssl_expiry');
    await queryRunner.dropIndex('custom_domains', 'IDX_custom_domains_type_resource');
    await queryRunner.dropIndex('custom_domains', 'IDX_custom_domains_tenant_status');
    await queryRunner.dropIndex('custom_domains', 'IDX_custom_domains_domain');

    // Drop table
    await queryRunner.dropTable('custom_domains');
  }
}
