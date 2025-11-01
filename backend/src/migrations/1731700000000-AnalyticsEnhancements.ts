import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class AnalyticsEnhancements1731700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists
    const tableExists = await queryRunner.hasTable('analytics_events');

    if (!tableExists) {
      // Create analytics_events table
      await queryRunner.createTable(
        new Table({
          name: 'analytics_events',
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
              name: 'eventType',
              type: 'varchar',
              length: '50',
              isNullable: false,
            },
            {
              name: 'entityType',
              type: 'varchar',
              length: '50',
              isNullable: true,
            },
            {
              name: 'entityId',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'contactId',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'affiliateId',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'sessionId',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'userAgent',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'ipAddress',
              type: 'varchar',
              length: '45',
              isNullable: true,
            },
            {
              name: 'url',
              type: 'varchar',
              length: '500',
              isNullable: true,
            },
            {
              name: 'referrer',
              type: 'varchar',
              length: '500',
              isNullable: true,
            },
            {
              name: 'deviceType',
              type: 'varchar',
              length: '100',
              isNullable: true,
            },
            {
              name: 'browser',
              type: 'varchar',
              length: '100',
              isNullable: true,
            },
            {
              name: 'os',
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
              name: 'city',
              type: 'varchar',
              length: '100',
              isNullable: true,
            },
            {
              name: 'value',
              type: 'decimal',
              precision: 10,
              scale: 2,
              isNullable: true,
            },
            {
              name: 'currency',
              type: 'varchar',
              length: '10',
              isNullable: true,
            },
            {
              name: 'utmSource',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'utmMedium',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'utmCampaign',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'utmTerm',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'utmContent',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'metadata',
              type: 'jsonb',
              default: "'{}'",
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
    } else {
      // Add new columns to existing table
      const hasValueColumn = await queryRunner.hasColumn('analytics_events', 'value');
      if (!hasValueColumn) {
        await queryRunner.query(
          `ALTER TABLE analytics_events ADD COLUMN "value" decimal(10,2) NULL`,
        );
      }

      const hasCurrencyColumn = await queryRunner.hasColumn('analytics_events', 'currency');
      if (!hasCurrencyColumn) {
        await queryRunner.query(
          `ALTER TABLE analytics_events ADD COLUMN "currency" varchar(10) NULL`,
        );
      }

      const hasUtmSourceColumn = await queryRunner.hasColumn('analytics_events', 'utmSource');
      if (!hasUtmSourceColumn) {
        await queryRunner.query(
          `ALTER TABLE analytics_events ADD COLUMN "utmSource" varchar(255) NULL`,
        );
      }

      const hasUtmMediumColumn = await queryRunner.hasColumn('analytics_events', 'utmMedium');
      if (!hasUtmMediumColumn) {
        await queryRunner.query(
          `ALTER TABLE analytics_events ADD COLUMN "utmMedium" varchar(255) NULL`,
        );
      }

      const hasUtmCampaignColumn = await queryRunner.hasColumn('analytics_events', 'utmCampaign');
      if (!hasUtmCampaignColumn) {
        await queryRunner.query(
          `ALTER TABLE analytics_events ADD COLUMN "utmCampaign" varchar(255) NULL`,
        );
      }

      const hasUtmTermColumn = await queryRunner.hasColumn('analytics_events', 'utmTerm');
      if (!hasUtmTermColumn) {
        await queryRunner.query(
          `ALTER TABLE analytics_events ADD COLUMN "utmTerm" varchar(255) NULL`,
        );
      }

      const hasUtmContentColumn = await queryRunner.hasColumn('analytics_events', 'utmContent');
      if (!hasUtmContentColumn) {
        await queryRunner.query(
          `ALTER TABLE analytics_events ADD COLUMN "utmContent" varchar(255) NULL`,
        );
      }
    }

    // Create indexes for performance
    const indexes = [
      new TableIndex({
        name: 'IDX_analytics_tenant_event_created',
        columnNames: ['tenantId', 'eventType', 'createdAt'],
      }),
      new TableIndex({
        name: 'IDX_analytics_entity',
        columnNames: ['entityType', 'entityId'],
      }),
      new TableIndex({
        name: 'IDX_analytics_contact',
        columnNames: ['contactId'],
      }),
      new TableIndex({
        name: 'IDX_analytics_affiliate',
        columnNames: ['affiliateId'],
      }),
      new TableIndex({
        name: 'IDX_analytics_session',
        columnNames: ['sessionId'],
      }),
      new TableIndex({
        name: 'IDX_analytics_utm_campaign',
        columnNames: ['utmCampaign'],
      }),
      new TableIndex({
        name: 'IDX_analytics_device_type',
        columnNames: ['deviceType'],
      }),
      new TableIndex({
        name: 'IDX_analytics_country',
        columnNames: ['country'],
      }),
    ];

    for (const index of indexes) {
      const indexExists = await queryRunner.getTable('analytics_events').then((table) =>
        table?.indices.some((i) => i.name === index.name),
      );
      if (!indexExists) {
        await queryRunner.createIndex('analytics_events', index);
      }
    }

    // Create foreign key for tenantId
    const foreignKeyExists = await queryRunner
      .getTable('analytics_events')
      .then((table) => table?.foreignKeys.some((fk) => fk.name === 'FK_analytics_tenant'));

    if (!foreignKeyExists) {
      await queryRunner.createForeignKey(
        'analytics_events',
        new TableForeignKey({
          name: 'FK_analytics_tenant',
          columnNames: ['tenantId'],
          referencedTableName: 'tenants',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    const foreignKeyExists = await queryRunner
      .getTable('analytics_events')
      .then((table) => table?.foreignKeys.some((fk) => fk.name === 'FK_analytics_tenant'));

    if (foreignKeyExists) {
      await queryRunner.dropForeignKey('analytics_events', 'FK_analytics_tenant');
    }

    // Drop indexes
    const indexNames = [
      'IDX_analytics_country',
      'IDX_analytics_device_type',
      'IDX_analytics_utm_campaign',
      'IDX_analytics_session',
      'IDX_analytics_affiliate',
      'IDX_analytics_contact',
      'IDX_analytics_entity',
      'IDX_analytics_tenant_event_created',
    ];

    for (const indexName of indexNames) {
      const indexExists = await queryRunner
        .getTable('analytics_events')
        .then((table) => table?.indices.some((i) => i.name === indexName));

      if (indexExists) {
        await queryRunner.dropIndex('analytics_events', indexName);
      }
    }

    // Drop columns (only the new ones)
    const columnsToRemove = [
      'utmContent',
      'utmTerm',
      'utmCampaign',
      'utmMedium',
      'utmSource',
      'currency',
      'value',
    ];

    for (const column of columnsToRemove) {
      const hasColumn = await queryRunner.hasColumn('analytics_events', column);
      if (hasColumn) {
        await queryRunner.dropColumn('analytics_events', column);
      }
    }
  }
}
