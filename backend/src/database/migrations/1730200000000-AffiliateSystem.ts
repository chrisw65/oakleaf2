import { MigrationInterface, QueryRunner } from 'typeorm';

export class AffiliateSystem1730200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create commission_plans table
    await queryRunner.query(`
      CREATE TABLE "commission_plans" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text,
        "type" varchar(50) NOT NULL DEFAULT 'percentage',
        "recurring_type" varchar(50) NOT NULL DEFAULT 'one_time',
        "tier1_rate" decimal(5,2),
        "tier2_rate" decimal(5,2),
        "tier3_rate" decimal(5,2),
        "cookie_duration_days" integer NOT NULL DEFAULT 30,
        "commission_hold_days" integer NOT NULL DEFAULT 30,
        "minimum_payout" decimal(10,2) DEFAULT 50.00,
        "settings" jsonb DEFAULT '{}',
        "is_active" boolean NOT NULL DEFAULT true,
        "is_default" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_commission_plans_tenant_id" ON "commission_plans" ("tenant_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_commission_plans_is_default" ON "commission_plans" ("tenant_id", "is_default", "is_active");
    `);

    // Create affiliates table
    await queryRunner.query(`
      CREATE TABLE "affiliates" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "affiliate_code" varchar(50) NOT NULL UNIQUE,
        "parent_affiliate_id" uuid,
        "commission_plan_id" uuid,
        "status" varchar(50) NOT NULL DEFAULT 'pending',
        "total_earnings" decimal(10,2) NOT NULL DEFAULT 0,
        "total_paid" decimal(10,2) NOT NULL DEFAULT 0,
        "pending_balance" decimal(10,2) NOT NULL DEFAULT 0,
        "total_clicks" integer NOT NULL DEFAULT 0,
        "total_conversions" integer NOT NULL DEFAULT 0,
        "conversion_rate" decimal(5,2) NOT NULL DEFAULT 0,
        "payment_info" jsonb DEFAULT '{}',
        "metadata" jsonb DEFAULT '{}',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        CONSTRAINT "FK_affiliates_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_affiliates_parent" FOREIGN KEY ("parent_affiliate_id") REFERENCES "affiliates"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_affiliates_commission_plan" FOREIGN KEY ("commission_plan_id") REFERENCES "commission_plans"("id") ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_affiliates_tenant_id" ON "affiliates" ("tenant_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_affiliates_user_id" ON "affiliates" ("tenant_id", "user_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_affiliates_code" ON "affiliates" ("affiliate_code");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_affiliates_parent" ON "affiliates" ("parent_affiliate_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_affiliates_status" ON "affiliates" ("tenant_id", "status");
    `);

    // Create affiliate_clicks table
    await queryRunner.query(`
      CREATE TABLE "affiliate_clicks" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "affiliate_id" uuid NOT NULL,
        "visitor_id" varchar(255) NOT NULL,
        "ip_address" varchar(100),
        "user_agent" text,
        "referrer" text,
        "landing_page" text,
        "utm_params" jsonb DEFAULT '{}',
        "device" varchar(50),
        "browser" varchar(50),
        "os" varchar(50),
        "country" varchar(100),
        "city" varchar(100),
        "converted" boolean NOT NULL DEFAULT false,
        "converted_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        CONSTRAINT "FK_affiliate_clicks_affiliate" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_affiliate_clicks_tenant_affiliate" ON "affiliate_clicks" ("tenant_id", "affiliate_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_affiliate_clicks_visitor" ON "affiliate_clicks" ("visitor_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_affiliate_clicks_converted" ON "affiliate_clicks" ("tenant_id", "converted", "created_at");
    `);

    // Create commissions table
    await queryRunner.query(`
      CREATE TABLE "commissions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "affiliate_id" uuid NOT NULL,
        "order_id" uuid NOT NULL,
        "product_id" uuid,
        "click_id" uuid,
        "commission_plan_id" uuid,
        "tier" integer NOT NULL DEFAULT 1,
        "amount" decimal(10,2) NOT NULL,
        "rate" decimal(5,2) NOT NULL,
        "order_amount" decimal(10,2) NOT NULL,
        "status" varchar(50) NOT NULL DEFAULT 'pending',
        "payout_id" uuid,
        "payable_at" timestamp,
        "paid_at" timestamp,
        "notes" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        CONSTRAINT "FK_commissions_affiliate" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_commissions_click" FOREIGN KEY ("click_id") REFERENCES "affiliate_clicks"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_commissions_commission_plan" FOREIGN KEY ("commission_plan_id") REFERENCES "commission_plans"("id") ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_commissions_tenant_affiliate" ON "commissions" ("tenant_id", "affiliate_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_commissions_order" ON "commissions" ("order_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_commissions_status" ON "commissions" ("tenant_id", "status");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_commissions_payable" ON "commissions" ("tenant_id", "status", "payable_at");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_commissions_tier" ON "commissions" ("tenant_id", "tier");
    `);

    // Create payouts table
    await queryRunner.query(`
      CREATE TABLE "payouts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "affiliate_id" uuid NOT NULL,
        "amount" decimal(10,2) NOT NULL,
        "status" varchar(50) NOT NULL DEFAULT 'pending',
        "method" varchar(50) NOT NULL,
        "payment_details" jsonb DEFAULT '{}',
        "commission_ids" jsonb DEFAULT '[]',
        "commission_count" integer NOT NULL DEFAULT 0,
        "processed_at" timestamp,
        "notes" text,
        "failure_reason" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        CONSTRAINT "FK_payouts_affiliate" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_payouts_tenant_affiliate" ON "payouts" ("tenant_id", "affiliate_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_payouts_status" ON "payouts" ("tenant_id", "status");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_payouts_method" ON "payouts" ("tenant_id", "method");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_payouts_created_at" ON "payouts" ("created_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "payouts" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "commissions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "affiliate_clicks" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "affiliates" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "commission_plans" CASCADE;`);
  }
}
