import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class FileUploadSystem1731200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create files table
    await queryRunner.createTable(
      new Table({
        name: 'files',
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
            name: 'filename',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'key',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'bucket',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'provider',
            type: 'enum',
            enum: ['s3', 'minio', 'local'],
            default: "'s3'",
          },
          {
            name: 'mimeType',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['image', 'video', 'document', 'audio', 'archive', 'other'],
          },
          {
            name: 'size',
            type: 'bigint',
          },
          {
            name: 'url',
            type: 'varchar',
            length: '1000',
            isNullable: true,
          },
          {
            name: 'cdnUrl',
            type: 'varchar',
            length: '1000',
            isNullable: true,
          },
          {
            name: 'isPublic',
            type: 'boolean',
            default: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['uploading', 'completed', 'failed', 'deleted'],
            default: "'uploading'",
          },
          {
            name: 'uploadedBy',
            type: 'uuid',
          },
          {
            name: 'resourceType',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'resourceId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'hash',
            type: 'varchar',
            length: '64',
            isNullable: true,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'downloadCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'lastAccessedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'uploadId',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'isProcessed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'processingError',
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
      'files',
      new TableIndex({
        name: 'IDX_file_tenant_status',
        columnNames: ['tenantId', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'files',
      new TableIndex({
        name: 'IDX_file_uploaded_by',
        columnNames: ['uploadedBy'],
      }),
    );

    await queryRunner.createIndex(
      'files',
      new TableIndex({
        name: 'IDX_file_resource',
        columnNames: ['resourceType', 'resourceId'],
      }),
    );

    await queryRunner.createIndex(
      'files',
      new TableIndex({
        name: 'IDX_file_hash',
        columnNames: ['hash'],
      }),
    );

    await queryRunner.createIndex(
      'files',
      new TableIndex({
        name: 'IDX_file_expires',
        columnNames: ['expiresAt'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'files',
      new TableForeignKey({
        name: 'FK_file_tenant',
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'files',
      new TableForeignKey({
        name: 'FK_file_user',
        columnNames: ['uploadedBy'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('files', 'FK_file_user');
    await queryRunner.dropForeignKey('files', 'FK_file_tenant');

    // Drop indexes
    await queryRunner.dropIndex('files', 'IDX_file_expires');
    await queryRunner.dropIndex('files', 'IDX_file_hash');
    await queryRunner.dropIndex('files', 'IDX_file_resource');
    await queryRunner.dropIndex('files', 'IDX_file_uploaded_by');
    await queryRunner.dropIndex('files', 'IDX_file_tenant_status');

    // Drop table
    await queryRunner.dropTable('files');
  }
}
