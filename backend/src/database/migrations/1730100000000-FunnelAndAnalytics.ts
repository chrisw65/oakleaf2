import { MigrationInterface, QueryRunner } from 'typeorm';

export class FunnelAndAnalytics1730100000000 implements MigrationInterface {
  name = 'FunnelAndAnalytics1730100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create funnels table
    await queryRunner.query(`
      CREATE TABLE "funnels" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "description" text,
        "status" character varying(50) NOT NULL DEFAULT 'draft',
        "type" character varying(50),
        "custom_domain" character varying(255),
        "favicon" character varying(255),
        "settings" jsonb DEFAULT '{}',
        "theme" jsonb DEFAULT '{}',
        "created_by" uuid,
        "published_at" TIMESTAMP,
        "last_edited_at" TIMESTAMP,
        "views" integer DEFAULT 0,
        "conversions" integer DEFAULT 0,
        "conversion_rate" decimal(5,2) DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_funnels" PRIMARY KEY ("id"),
        CONSTRAINT "FK_funnels_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_funnels_user" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_funnels_tenant_id" ON "funnels" ("tenant_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_funnels_slug" ON "funnels" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_funnels_status" ON "funnels" ("status")`);

    // Create pages table
    await queryRunner.query(`
      CREATE TABLE "pages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "funnel_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "description" text,
        "type" character varying(50) NOT NULL DEFAULT 'landing',
        "position" integer NOT NULL DEFAULT 0,
        "content" jsonb NOT NULL,
        "seo_settings" jsonb DEFAULT '{}',
        "styles" jsonb DEFAULT '{}',
        "settings" jsonb DEFAULT '{}',
        "is_published" boolean DEFAULT false,
        "published_at" TIMESTAMP,
        "thumbnail" character varying(255),
        "views" integer DEFAULT 0,
        "submissions" integer DEFAULT 0,
        "conversion_rate" decimal(5,2) DEFAULT 0,
        "is_variant" boolean DEFAULT false,
        "parent_page_id" uuid,
        "variant_name" character varying(50),
        "traffic_split" integer DEFAULT 50,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_pages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_pages_funnel" FOREIGN KEY ("funnel_id") REFERENCES "funnels"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_pages_tenant_id" ON "pages" ("tenant_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_pages_funnel_id" ON "pages" ("funnel_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_pages_slug" ON "pages" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_pages_position" ON "pages" ("position")`);

    // Create funnel_templates table
    await queryRunner.query(`
      CREATE TABLE "funnel_templates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "category" character varying(50) NOT NULL,
        "thumbnail" character varying(255),
        "structure" jsonb NOT NULL,
        "is_public" boolean DEFAULT false,
        "is_premium" boolean DEFAULT false,
        "usage_count" integer DEFAULT 0,
        "rating" decimal(3,2) DEFAULT 0,
        "tags" text,
        "industries" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_funnel_templates" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_templates_tenant_id" ON "funnel_templates" ("tenant_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_templates_category" ON "funnel_templates" ("category")`);

    // Create analytics_events table
    await queryRunner.query(`
      CREATE TABLE "analytics_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "event_type" character varying(50) NOT NULL,
        "entity_type" character varying(50),
        "entity_id" uuid,
        "contact_id" uuid,
        "affiliate_id" uuid,
        "session_id" uuid,
        "user_agent" character varying(255),
        "ip_address" character varying(45),
        "url" character varying(500),
        "referrer" character varying(500),
        "device_type" character varying(100),
        "browser" character varying(100),
        "os" character varying(100),
        "country" character varying(100),
        "city" character varying(100),
        "metadata" jsonb DEFAULT '{}',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_analytics_events" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_events_tenant_id" ON "analytics_events" ("tenant_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_events_type" ON "analytics_events" ("event_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_events_entity" ON "analytics_events" ("entity_type", "entity_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_events_tenant_type_date" ON "analytics_events" ("tenant_id", "event_type", "created_at")`);

    // Create forms table
    await queryRunner.query(`
      CREATE TABLE "forms" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "fields" jsonb NOT NULL,
        "settings" jsonb DEFAULT '{}',
        "submissions" integer DEFAULT 0,
        "is_active" boolean DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_forms" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_forms_tenant_id" ON "forms" ("tenant_id")`);

    // Create form_submissions table
    await queryRunner.query(`
      CREATE TABLE "form_submissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "form_id" uuid NOT NULL,
        "page_id" uuid,
        "contact_id" uuid,
        "data" jsonb NOT NULL,
        "ip_address" character varying(45),
        "user_agent" character varying(255),
        "referrer" character varying(500),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_form_submissions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_submissions_tenant_id" ON "form_submissions" ("tenant_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_submissions_form_id" ON "form_submissions" ("form_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_submissions_page_id" ON "form_submissions" ("page_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_submissions_contact_id" ON "form_submissions" ("contact_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "form_submissions"`);
    await queryRunner.query(`DROP TABLE "forms"`);
    await queryRunner.query(`DROP TABLE "analytics_events"`);
    await queryRunner.query(`DROP TABLE "funnel_templates"`);
    await queryRunner.query(`DROP TABLE "pages"`);
    await queryRunner.query(`DROP TABLE "funnels"`);
  }
}
