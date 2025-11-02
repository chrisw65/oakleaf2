import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class RbacSystem1730900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create permissions table
    await queryRunner.createTable(
      new Table({
        name: 'permissions',
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
            length: '100',
            isUnique: true,
          },
          {
            name: 'resource',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'action',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
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

    // Create roles table
    await queryRunner.createTable(
      new Table({
        name: 'roles',
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
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['system', 'custom'],
            default: "'custom'",
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'priority',
            type: 'int',
            default: 0,
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
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create role_permissions junction table
    await queryRunner.createTable(
      new Table({
        name: 'role_permissions',
        columns: [
          {
            name: 'roleId',
            type: 'uuid',
          },
          {
            name: 'permissionId',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    // Create indexes for permissions
    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'IDX_permission_tenant',
        columnNames: ['tenantId'],
      }),
    );

    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'IDX_permission_resource',
        columnNames: ['resource'],
      }),
    );

    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'IDX_permission_action',
        columnNames: ['action'],
      }),
    );

    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'IDX_permission_category',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'IDX_permission_tenant_resource',
        columnNames: ['tenantId', 'resource'],
      }),
    );

    // Create indexes for roles
    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'IDX_role_tenant',
        columnNames: ['tenantId'],
      }),
    );

    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'IDX_role_type',
        columnNames: ['type'],
      }),
    );

    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'IDX_role_tenant_name',
        columnNames: ['tenantId', 'name'],
      }),
    );

    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'IDX_role_priority',
        columnNames: ['priority'],
      }),
    );

    // Create indexes for role_permissions
    await queryRunner.createIndex(
      'role_permissions',
      new TableIndex({
        name: 'IDX_role_permission_role',
        columnNames: ['roleId'],
      }),
    );

    await queryRunner.createIndex(
      'role_permissions',
      new TableIndex({
        name: 'IDX_role_permission_permission',
        columnNames: ['permissionId'],
      }),
    );

    // Create primary key for role_permissions
    await queryRunner.query(`
      ALTER TABLE role_permissions
      ADD CONSTRAINT PK_role_permissions
      PRIMARY KEY (roleId, permissionId)
    `);

    // Create foreign keys
    await queryRunner.createForeignKey(
      'permissions',
      new TableForeignKey({
        name: 'FK_permission_tenant',
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'roles',
      new TableForeignKey({
        name: 'FK_role_tenant',
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        name: 'FK_role_permission_role',
        columnNames: ['roleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        name: 'FK_role_permission_permission',
        columnNames: ['permissionId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'permissions',
        onDelete: 'CASCADE',
      }),
    );

    // Add roleId column to users table if it doesn't exist
    const usersTable = await queryRunner.getTable('users');
    const hasRoleColumn = usersTable?.columns.find((col) => col.name === 'roleId');

    if (!hasRoleColumn) {
      await queryRunner.query(`
        ALTER TABLE users
        ADD COLUMN roleId uuid
      `);

      await queryRunner.createIndex(
        'users',
        new TableIndex({
          name: 'IDX_user_role',
          columnNames: ['roleId'],
        }),
      );

      await queryRunner.createForeignKey(
        'users',
        new TableForeignKey({
          name: 'FK_user_role',
          columnNames: ['roleId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'roles',
          onDelete: 'SET NULL',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key and column from users table
    const usersTable = await queryRunner.getTable('users');
    const roleFK = usersTable?.foreignKeys.find((fk) => fk.name === 'FK_user_role');
    if (roleFK) {
      await queryRunner.dropForeignKey('users', roleFK);
    }

    const roleIndex = usersTable?.indices.find((idx) => idx.name === 'IDX_user_role');
    if (roleIndex) {
      await queryRunner.dropIndex('users', roleIndex);
    }

    const hasRoleColumn = usersTable?.columns.find((col) => col.name === 'roleId');
    if (hasRoleColumn) {
      await queryRunner.query(`ALTER TABLE users DROP COLUMN roleId`);
    }

    // Drop foreign keys
    await queryRunner.dropForeignKey('role_permissions', 'FK_role_permission_permission');
    await queryRunner.dropForeignKey('role_permissions', 'FK_role_permission_role');
    await queryRunner.dropForeignKey('roles', 'FK_role_tenant');
    await queryRunner.dropForeignKey('permissions', 'FK_permission_tenant');

    // Drop indexes
    await queryRunner.dropIndex('role_permissions', 'IDX_role_permission_permission');
    await queryRunner.dropIndex('role_permissions', 'IDX_role_permission_role');
    await queryRunner.dropIndex('roles', 'IDX_role_priority');
    await queryRunner.dropIndex('roles', 'IDX_role_tenant_name');
    await queryRunner.dropIndex('roles', 'IDX_role_type');
    await queryRunner.dropIndex('roles', 'IDX_role_tenant');
    await queryRunner.dropIndex('permissions', 'IDX_permission_tenant_resource');
    await queryRunner.dropIndex('permissions', 'IDX_permission_category');
    await queryRunner.dropIndex('permissions', 'IDX_permission_action');
    await queryRunner.dropIndex('permissions', 'IDX_permission_resource');
    await queryRunner.dropIndex('permissions', 'IDX_permission_tenant');

    // Drop primary key constraint
    await queryRunner.query(`ALTER TABLE role_permissions DROP CONSTRAINT PK_role_permissions`);

    // Drop tables
    await queryRunner.dropTable('role_permissions');
    await queryRunner.dropTable('roles');
    await queryRunner.dropTable('permissions');
  }
}
