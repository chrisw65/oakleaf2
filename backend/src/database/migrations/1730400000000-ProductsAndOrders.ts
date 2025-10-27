import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class ProductsAndOrders1730400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create products table
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
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
            name: 'slug',
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
            name: 'product_type',
            type: 'varchar',
            length: '50',
            default: "'physical'",
          },
          {
            name: 'sku',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'compare_at_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'cost_per_item',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'track_inventory',
            type: 'boolean',
            default: true,
          },
          {
            name: 'inventory_quantity',
            type: 'integer',
            default: 0,
          },
          {
            name: 'allow_backorder',
            type: 'boolean',
            default: false,
          },
          {
            name: 'low_stock_threshold',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'weight',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'weight_unit',
            type: 'varchar',
            length: '10',
            default: "'kg'",
          },
          {
            name: 'requires_shipping',
            type: 'boolean',
            default: true,
          },
          {
            name: 'taxable',
            type: 'boolean',
            default: true,
          },
          {
            name: 'tax_code',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'draft'",
          },
          {
            name: 'published_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'variants',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'images',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'categories',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'tags',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'seo_title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'seo_description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'seo_keywords',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'sales_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_revenue',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'view_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
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
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create orders table
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'order_number',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'contact_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'customer_email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'customer_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'customer_phone',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'payment_status',
            type: 'varchar',
            length: '50',
            default: "'unpaid'",
          },
          {
            name: 'fulfillment_status',
            type: 'varchar',
            length: '50',
            default: "'unfulfilled'",
          },
          {
            name: 'subtotal',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'discount_code',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'discount_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'tax_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'shipping_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'total',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'billing_address',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'shipping_address',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'payment_method',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'payment_transaction_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'tracking_number',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'tracking_carrier',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'tracking_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'customer_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'internal_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'refunded_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'refund_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'refund_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_test',
            type: 'boolean',
            default: false,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
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
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create order_items table
    await queryRunner.createTable(
      new Table({
        name: 'order_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'order_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'product_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'product_sku',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'variant_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'variant_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'quantity',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'unit_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'total_price',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'tax_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'shipping_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'discount_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'product_snapshot',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
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
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create carts table
    await queryRunner.createTable(
      new Table({
        name: 'carts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'session_id',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'contact_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'subtotal',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'discount_code',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'discount_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'tax_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'shipping_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'total',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'last_activity_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'converted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'order_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'abandoned',
            type: 'boolean',
            default: false,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
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
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create cart_items table
    await queryRunner.createTable(
      new Table({
        name: 'cart_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'cart_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'variant_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'quantity',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'unit_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'total_price',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'customizations',
            type: 'jsonb',
            default: "'{}'",
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
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for products table
    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_PRODUCTS_TENANT_ID',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_PRODUCTS_SLUG',
        columnNames: ['slug'],
      }),
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_PRODUCTS_SKU',
        columnNames: ['sku'],
      }),
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_PRODUCTS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_PRODUCTS_TENANT_SLUG',
        columnNames: ['tenant_id', 'slug'],
      }),
    );

    // Create indexes for orders table
    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_ORDERS_TENANT_ID',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_ORDERS_ORDER_NUMBER',
        columnNames: ['order_number'],
      }),
    );

    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_ORDERS_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_ORDERS_CONTACT_ID',
        columnNames: ['contact_id'],
      }),
    );

    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_ORDERS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_ORDERS_PAYMENT_STATUS',
        columnNames: ['payment_status'],
      }),
    );

    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_ORDERS_FULFILLMENT_STATUS',
        columnNames: ['fulfillment_status'],
      }),
    );

    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_ORDERS_CUSTOMER_EMAIL',
        columnNames: ['customer_email'],
      }),
    );

    // Create indexes for order_items table
    await queryRunner.createIndex(
      'order_items',
      new TableIndex({
        name: 'IDX_ORDER_ITEMS_TENANT_ID',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'order_items',
      new TableIndex({
        name: 'IDX_ORDER_ITEMS_ORDER_ID',
        columnNames: ['order_id'],
      }),
    );

    await queryRunner.createIndex(
      'order_items',
      new TableIndex({
        name: 'IDX_ORDER_ITEMS_PRODUCT_ID',
        columnNames: ['product_id'],
      }),
    );

    // Create indexes for carts table
    await queryRunner.createIndex(
      'carts',
      new TableIndex({
        name: 'IDX_CARTS_TENANT_ID',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'carts',
      new TableIndex({
        name: 'IDX_CARTS_SESSION_ID',
        columnNames: ['session_id'],
      }),
    );

    await queryRunner.createIndex(
      'carts',
      new TableIndex({
        name: 'IDX_CARTS_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'carts',
      new TableIndex({
        name: 'IDX_CARTS_CONTACT_ID',
        columnNames: ['contact_id'],
      }),
    );

    await queryRunner.createIndex(
      'carts',
      new TableIndex({
        name: 'IDX_CARTS_ABANDONED',
        columnNames: ['abandoned'],
      }),
    );

    await queryRunner.createIndex(
      'carts',
      new TableIndex({
        name: 'IDX_CARTS_TENANT_SESSION',
        columnNames: ['tenant_id', 'session_id'],
      }),
    );

    // Create indexes for cart_items table
    await queryRunner.createIndex(
      'cart_items',
      new TableIndex({
        name: 'IDX_CART_ITEMS_TENANT_ID',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'cart_items',
      new TableIndex({
        name: 'IDX_CART_ITEMS_CART_ID',
        columnNames: ['cart_id'],
      }),
    );

    await queryRunner.createIndex(
      'cart_items',
      new TableIndex({
        name: 'IDX_CART_ITEMS_PRODUCT_ID',
        columnNames: ['product_id'],
      }),
    );

    // Create foreign keys for orders table
    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        columnNames: ['contact_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'contacts',
        onDelete: 'SET NULL',
      }),
    );

    // Create foreign keys for order_items table
    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'orders',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'SET NULL',
      }),
    );

    // Create foreign keys for carts table
    await queryRunner.createForeignKey(
      'carts',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'carts',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'carts',
      new TableForeignKey({
        columnNames: ['contact_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'contacts',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'carts',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'orders',
        onDelete: 'SET NULL',
      }),
    );

    // Create foreign keys for cart_items table
    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({
        columnNames: ['cart_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'carts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const cartItemsTable = await queryRunner.getTable('cart_items');
    const cartItemsForeignKeys = cartItemsTable?.foreignKeys.filter(
      (fk) =>
        fk.columnNames.indexOf('product_id') !== -1 ||
        fk.columnNames.indexOf('cart_id') !== -1 ||
        fk.columnNames.indexOf('tenant_id') !== -1,
    );
    if (cartItemsForeignKeys) {
      for (const fk of cartItemsForeignKeys) {
        await queryRunner.dropForeignKey('cart_items', fk);
      }
    }

    const cartsTable = await queryRunner.getTable('carts');
    const cartsForeignKeys = cartsTable?.foreignKeys.filter(
      (fk) =>
        fk.columnNames.indexOf('order_id') !== -1 ||
        fk.columnNames.indexOf('contact_id') !== -1 ||
        fk.columnNames.indexOf('user_id') !== -1 ||
        fk.columnNames.indexOf('tenant_id') !== -1,
    );
    if (cartsForeignKeys) {
      for (const fk of cartsForeignKeys) {
        await queryRunner.dropForeignKey('carts', fk);
      }
    }

    const orderItemsTable = await queryRunner.getTable('order_items');
    const orderItemsForeignKeys = orderItemsTable?.foreignKeys.filter(
      (fk) =>
        fk.columnNames.indexOf('product_id') !== -1 ||
        fk.columnNames.indexOf('order_id') !== -1 ||
        fk.columnNames.indexOf('tenant_id') !== -1,
    );
    if (orderItemsForeignKeys) {
      for (const fk of orderItemsForeignKeys) {
        await queryRunner.dropForeignKey('order_items', fk);
      }
    }

    const ordersTable = await queryRunner.getTable('orders');
    const ordersForeignKeys = ordersTable?.foreignKeys.filter(
      (fk) =>
        fk.columnNames.indexOf('contact_id') !== -1 ||
        fk.columnNames.indexOf('user_id') !== -1 ||
        fk.columnNames.indexOf('tenant_id') !== -1,
    );
    if (ordersForeignKeys) {
      for (const fk of ordersForeignKeys) {
        await queryRunner.dropForeignKey('orders', fk);
      }
    }

    // Drop tables
    await queryRunner.dropTable('cart_items', true);
    await queryRunner.dropTable('carts', true);
    await queryRunner.dropTable('order_items', true);
    await queryRunner.dropTable('orders', true);
    await queryRunner.dropTable('products', true);
  }
}
