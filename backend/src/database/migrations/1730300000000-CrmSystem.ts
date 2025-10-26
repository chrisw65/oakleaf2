import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrmSystem1730300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create contacts table
    await queryRunner.query(`
      CREATE TABLE "contacts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "first_name" varchar(255),
        "last_name" varchar(255),
        "email" varchar(255) NOT NULL,
        "phone" varchar(50),
        "company" varchar(255),
        "job_title" varchar(255),
        "website" varchar(255),
        "address" text,
        "city" varchar(100),
        "state" varchar(100),
        "zip_code" varchar(20),
        "country" varchar(100),
        "source" varchar(50) NOT NULL DEFAULT 'manual',
        "status" varchar(50) NOT NULL DEFAULT 'active',
        "score" integer NOT NULL DEFAULT 0,
        "lifetime_value" decimal(10,2) NOT NULL DEFAULT 0,
        "avatar_url" varchar(255),
        "social_profiles" jsonb DEFAULT '{}',
        "metadata" jsonb DEFAULT '{}',
        "owner_id" uuid,
        "last_contacted_at" timestamp,
        "last_activity_at" timestamp,
        "is_subscribed" boolean NOT NULL DEFAULT false,
        "subscribed_at" timestamp,
        "unsubscribed_at" timestamp,
        "email_verified" boolean NOT NULL DEFAULT false,
        "phone_verified" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        CONSTRAINT "FK_contacts_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_contacts_tenant" ON "contacts" ("tenant_id");
      CREATE INDEX "IDX_contacts_email" ON "contacts" ("email");
      CREATE INDEX "IDX_contacts_source" ON "contacts" ("tenant_id", "source");
      CREATE INDEX "IDX_contacts_status" ON "contacts" ("tenant_id", "status");
      CREATE INDEX "IDX_contacts_owner" ON "contacts" ("owner_id");
      CREATE INDEX "IDX_contacts_subscribed" ON "contacts" ("is_subscribed");
    `);

    // Create tags table
    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "name" varchar(100) NOT NULL,
        "color" varchar(7) NOT NULL DEFAULT '#3B82F6',
        "description" text,
        "contact_count" integer NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tags_tenant" ON "tags" ("tenant_id");
      CREATE INDEX "IDX_tags_name" ON "tags" ("tenant_id", "name");
    `);

    // Create contact_tags junction table
    await queryRunner.query(`
      CREATE TABLE "contact_tags" (
        "contact_id" uuid NOT NULL,
        "tag_id" uuid NOT NULL,
        PRIMARY KEY ("contact_id", "tag_id"),
        CONSTRAINT "FK_contact_tags_contact" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_contact_tags_tag" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE
      );
    `);

    // Create custom_fields table
    await queryRunner.query(`
      CREATE TABLE "custom_fields" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "name" varchar(100) NOT NULL,
        "field_key" varchar(100) NOT NULL,
        "field_type" varchar(50) NOT NULL,
        "options" jsonb DEFAULT '{}',
        "is_required" boolean NOT NULL DEFAULT false,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_custom_fields_tenant" ON "custom_fields" ("tenant_id");
      CREATE INDEX "IDX_custom_fields_key" ON "custom_fields" ("tenant_id", "field_key");
    `);

    // Create contact_custom_field_values table
    await queryRunner.query(`
      CREATE TABLE "contact_custom_field_values" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "contact_id" uuid NOT NULL,
        "custom_field_id" uuid NOT NULL,
        "value" jsonb NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        CONSTRAINT "FK_contact_custom_field_values_contact" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_contact_custom_field_values_field" FOREIGN KEY ("custom_field_id") REFERENCES "custom_fields"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_contact_custom_field_values_contact" ON "contact_custom_field_values" ("contact_id");
      CREATE INDEX "IDX_contact_custom_field_values_field" ON "contact_custom_field_values" ("custom_field_id");
    `);

    // Create pipelines table
    await queryRunner.query(`
      CREATE TABLE "pipelines" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "is_default" boolean NOT NULL DEFAULT false,
        "opportunity_count" integer NOT NULL DEFAULT 0,
        "total_value" decimal(15,2) NOT NULL DEFAULT 0,
        "settings" jsonb DEFAULT '{}',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_pipelines_tenant" ON "pipelines" ("tenant_id");
      CREATE INDEX "IDX_pipelines_default" ON "pipelines" ("tenant_id", "is_default");
    `);

    // Create pipeline_stages table
    await queryRunner.query(`
      CREATE TABLE "pipeline_stages" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "pipeline_id" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "position" integer NOT NULL,
        "stage_type" varchar(50) NOT NULL DEFAULT 'open',
        "probability" integer NOT NULL DEFAULT 0,
        "color" varchar(7) NOT NULL DEFAULT '#3B82F6',
        "is_active" boolean NOT NULL DEFAULT true,
        "opportunity_count" integer NOT NULL DEFAULT 0,
        "total_value" decimal(15,2) NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        CONSTRAINT "FK_pipeline_stages_pipeline" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_pipeline_stages_pipeline" ON "pipeline_stages" ("pipeline_id");
      CREATE INDEX "IDX_pipeline_stages_position" ON "pipeline_stages" ("pipeline_id", "position");
    `);

    // Create opportunities table
    await queryRunner.query(`
      CREATE TABLE "opportunities" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "title" varchar(255) NOT NULL,
        "description" text,
        "contact_id" uuid NOT NULL,
        "pipeline_id" uuid NOT NULL,
        "stage_id" uuid NOT NULL,
        "owner_id" uuid,
        "value" decimal(15,2) NOT NULL DEFAULT 0,
        "currency" varchar(10) NOT NULL DEFAULT 'USD',
        "probability" integer NOT NULL DEFAULT 0,
        "expected_value" decimal(15,2) NOT NULL DEFAULT 0,
        "status" varchar(50) NOT NULL DEFAULT 'open',
        "priority" varchar(50) NOT NULL DEFAULT 'medium',
        "expected_close_date" timestamp,
        "actual_close_date" timestamp,
        "lost_reason" varchar(255),
        "metadata" jsonb DEFAULT '{}',
        "last_activity_at" timestamp,
        "days_in_stage" integer NOT NULL DEFAULT 0,
        "stage_position" integer NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        CONSTRAINT "FK_opportunities_contact" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_opportunities_pipeline" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_opportunities_stage" FOREIGN KEY ("stage_id") REFERENCES "pipeline_stages"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_opportunities_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_opportunities_tenant" ON "opportunities" ("tenant_id");
      CREATE INDEX "IDX_opportunities_contact" ON "opportunities" ("contact_id");
      CREATE INDEX "IDX_opportunities_pipeline" ON "opportunities" ("pipeline_id");
      CREATE INDEX "IDX_opportunities_stage" ON "opportunities" ("stage_id");
      CREATE INDEX "IDX_opportunities_owner" ON "opportunities" ("owner_id");
      CREATE INDEX "IDX_opportunities_status" ON "opportunities" ("tenant_id", "status");
    `);

    // Create contact_activities table
    await queryRunner.query(`
      CREATE TABLE "contact_activities" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "contact_id" uuid NOT NULL,
        "activity_type" varchar(100) NOT NULL,
        "title" varchar(255),
        "description" text,
        "metadata" jsonb DEFAULT '{}',
        "user_id" uuid,
        "occurred_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "deleted_at" timestamp,
        CONSTRAINT "FK_contact_activities_contact" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_contact_activities_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_contact_activities_contact" ON "contact_activities" ("contact_id");
      CREATE INDEX "IDX_contact_activities_type" ON "contact_activities" ("activity_type");
      CREATE INDEX "IDX_contact_activities_user" ON "contact_activities" ("user_id");
      CREATE INDEX "IDX_contact_activities_occurred" ON "contact_activities" ("occurred_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "contact_activities" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "opportunities" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pipeline_stages" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pipelines" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "contact_custom_field_values" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "custom_fields" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "contact_tags" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tags" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "contacts" CASCADE;`);
  }
}
