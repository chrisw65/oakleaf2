import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class PaymentSystem1731100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create payments table
    await queryRunner.createTable(
      new Table({
        name: 'payments',
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
            name: 'orderId',
            type: 'uuid',
          },
          {
            name: 'customerId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'subscriptionId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'stripePaymentIntentId',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'stripeChargeId',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'stripeCustomerId',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded', 'partially_refunded'],
            default: "'pending'",
          },
          {
            name: 'paymentMethod',
            type: 'enum',
            enum: ['card', 'bank_account', 'paypal', 'crypto', 'other'],
            default: "'card'",
          },
          {
            name: 'currency',
            type: 'enum',
            enum: ['usd', 'eur', 'gbp', 'cad', 'aud'],
            default: "'usd'",
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'amountRefunded',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'applicationFeeAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'receiptUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'receiptEmail',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'failureCode',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'failureMessage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'paymentMethodDetails',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'billingDetails',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'stripeRefundId',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'paidAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'refundedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'canceledAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'isTest',
            type: 'boolean',
            default: false,
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

    // Create subscriptions table
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
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
            name: 'customerId',
            type: 'uuid',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'stripeSubscriptionId',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'stripeCustomerId',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'stripePriceId',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'stripeProductId',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'past_due', 'canceled', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired', 'paused'],
            default: "'active'",
          },
          {
            name: 'productId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'planName',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'interval',
            type: 'enum',
            enum: ['day', 'week', 'month', 'year'],
            default: "'month'",
          },
          {
            name: 'intervalCount',
            type: 'int',
            default: 1,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'usd'",
          },
          {
            name: 'trialAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'trialDays',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'trialStart',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'trialEnd',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'currentPeriodStart',
            type: 'timestamp',
          },
          {
            name: 'currentPeriodEnd',
            type: 'timestamp',
          },
          {
            name: 'canceledAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'cancelAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'cancelAtPeriodEnd',
            type: 'boolean',
            default: false,
          },
          {
            name: 'endedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'quantity',
            type: 'int',
            default: 0,
          },
          {
            name: 'discountPercent',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'couponCode',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'lastPaymentId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'lastPaymentAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'nextPaymentAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'failedPaymentCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'isPaused',
            type: 'boolean',
            default: false,
          },
          {
            name: 'pausedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'resumedAt',
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

    // Create payment_methods table
    await queryRunner.createTable(
      new Table({
        name: 'payment_methods',
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
            name: 'customerId',
            type: 'uuid',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'stripePaymentMethodId',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'stripeCustomerId',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['card', 'bank_account', 'paypal'],
            default: "'card'",
          },
          {
            name: 'isDefault',
            type: 'boolean',
            default: false,
          },
          {
            name: 'card',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'bankAccount',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'billingDetails',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'lastUsedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'verifiedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'expiresAt',
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

    // Create indexes for payments
    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_payment_tenant_status',
        columnNames: ['tenantId', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_payment_order',
        columnNames: ['orderId'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_payment_stripe_intent',
        columnNames: ['stripePaymentIntentId'],
      }),
    );

    // Create indexes for subscriptions
    await queryRunner.createIndex(
      'subscriptions',
      new TableIndex({
        name: 'IDX_subscription_tenant_status',
        columnNames: ['tenantId', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'subscriptions',
      new TableIndex({
        name: 'IDX_subscription_customer',
        columnNames: ['customerId'],
      }),
    );

    await queryRunner.createIndex(
      'subscriptions',
      new TableIndex({
        name: 'IDX_subscription_stripe',
        columnNames: ['stripeSubscriptionId'],
      }),
    );

    // Create indexes for payment_methods
    await queryRunner.createIndex(
      'payment_methods',
      new TableIndex({
        name: 'IDX_payment_method_tenant_customer',
        columnNames: ['tenantId', 'customerId'],
      }),
    );

    await queryRunner.createIndex(
      'payment_methods',
      new TableIndex({
        name: 'IDX_payment_method_stripe',
        columnNames: ['stripePaymentMethodId'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        name: 'FK_payment_tenant',
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'subscriptions',
      new TableForeignKey({
        name: 'FK_subscription_tenant',
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'payment_methods',
      new TableForeignKey({
        name: 'FK_payment_method_tenant',
        columnNames: ['tenantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('payment_methods', 'FK_payment_method_tenant');
    await queryRunner.dropForeignKey('subscriptions', 'FK_subscription_tenant');
    await queryRunner.dropForeignKey('payments', 'FK_payment_tenant');

    // Drop indexes
    await queryRunner.dropIndex('payment_methods', 'IDX_payment_method_stripe');
    await queryRunner.dropIndex('payment_methods', 'IDX_payment_method_tenant_customer');
    await queryRunner.dropIndex('subscriptions', 'IDX_subscription_stripe');
    await queryRunner.dropIndex('subscriptions', 'IDX_subscription_customer');
    await queryRunner.dropIndex('subscriptions', 'IDX_subscription_tenant_status');
    await queryRunner.dropIndex('payments', 'IDX_payment_stripe_intent');
    await queryRunner.dropIndex('payments', 'IDX_payment_order');
    await queryRunner.dropIndex('payments', 'IDX_payment_tenant_status');

    // Drop tables
    await queryRunner.dropTable('payment_methods');
    await queryRunner.dropTable('subscriptions');
    await queryRunner.dropTable('payments');
  }
}
