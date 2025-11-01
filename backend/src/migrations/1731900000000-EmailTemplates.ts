import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class EmailTemplates1731900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create email_templates table
    await queryRunner.createTable(
      new Table({
        name: 'email_templates',
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
            name: 'category',
            type: 'enum',
            enum: [
              'marketing',
              'transactional',
              'notification',
              'welcome',
              'abandoned_cart',
              'order_confirmation',
              'newsletter',
              'promotional',
              'custom',
            ],
            default: "'custom'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'active', 'archived'],
            default: "'draft'",
          },
          {
            name: 'subject',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'preheader',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'htmlContent',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'textContent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'designSettings',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'variables',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'thumbnailUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'createdBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'clonedFrom',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'usageCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'lastUsedAt',
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
      'email_templates',
      new TableIndex({
        name: 'IDX_email_templates_tenant_category',
        columnNames: ['tenantId', 'category'],
      }),
    );

    await queryRunner.createIndex(
      'email_templates',
      new TableIndex({
        name: 'IDX_email_templates_tenant_status',
        columnNames: ['tenantId', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'email_templates',
      new TableIndex({
        name: 'IDX_email_templates_created_by',
        columnNames: ['createdBy'],
      }),
    );

    await queryRunner.createIndex(
      'email_templates',
      new TableIndex({
        name: 'IDX_email_templates_name',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      'email_templates',
      new TableIndex({
        name: 'IDX_email_templates_usage',
        columnNames: ['usageCount'],
      }),
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'email_templates',
      new TableForeignKey({
        name: 'FK_email_templates_tenant',
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
    await queryRunner.dropForeignKey('email_templates', 'FK_email_templates_tenant');

    // Drop indexes
    await queryRunner.dropIndex('email_templates', 'IDX_email_templates_usage');
    await queryRunner.dropIndex('email_templates', 'IDX_email_templates_name');
    await queryRunner.dropIndex('email_templates', 'IDX_email_templates_created_by');
    await queryRunner.dropIndex('email_templates', 'IDX_email_templates_tenant_status');
    await queryRunner.dropIndex('email_templates', 'IDX_email_templates_tenant_category');

    // Drop table
    await queryRunner.dropTable('email_templates');
  }
}
