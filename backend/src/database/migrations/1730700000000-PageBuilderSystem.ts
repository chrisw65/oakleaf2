import { MigrationInterface, QueryRunner } from 'typeorm';

export class PageBuilderSystem1730700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create page_elements table
    await queryRunner.query(`
      CREATE TABLE page_elements (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        page_id UUID NOT NULL,
        element_type VARCHAR(50) NOT NULL,
        content JSONB DEFAULT '{}',
        styles JSONB DEFAULT '{}',
        settings JSONB DEFAULT '{}',
        parent_id UUID,
        "order" INTEGER DEFAULT 0,
        element_name VARCHAR(255),
        is_visible BOOLEAN DEFAULT true,
        conditional_visibility JSONB DEFAULT '{}',
        interactions JSONB DEFAULT '{}',
        animations JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP,
        FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES page_elements(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_page_elements_tenant_id ON page_elements(tenant_id);
      CREATE INDEX idx_page_elements_page_id ON page_elements(page_id);
      CREATE INDEX idx_page_elements_element_type ON page_elements(element_type);
      CREATE INDEX idx_page_elements_parent_id ON page_elements(parent_id);
    `);

    // Create page_blocks table
    await queryRunner.query(`
      CREATE TABLE page_blocks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        structure JSONB NOT NULL,
        thumbnail VARCHAR(500),
        is_public BOOLEAN DEFAULT true,
        usage_count INTEGER DEFAULT 0,
        tags TEXT[],
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP
      );

      CREATE INDEX idx_page_blocks_tenant_id ON page_blocks(tenant_id);
      CREATE INDEX idx_page_blocks_slug ON page_blocks(slug);
      CREATE INDEX idx_page_blocks_category ON page_blocks(category);
    `);

    // Create template_categories table
    await queryRunner.query(`
      CREATE TABLE template_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(500),
        "order" INTEGER DEFAULT 0,
        template_count INTEGER DEFAULT 0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP
      );

      CREATE INDEX idx_template_categories_tenant_id ON template_categories(tenant_id);
      CREATE INDEX idx_template_categories_slug ON template_categories(slug);
    `);

    // Create template_reviews table
    await queryRunner.query(`
      CREATE TABLE template_reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        template_id UUID NOT NULL,
        user_id UUID NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        helpful_count INTEGER DEFAULT 0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES funnel_templates(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_template_reviews_tenant_id ON template_reviews(tenant_id);
      CREATE INDEX idx_template_reviews_template_id ON template_reviews(template_id);
      CREATE INDEX idx_template_reviews_user_id ON template_reviews(user_id);
    `);

    // Create page_popups table
    await queryRunner.query(`
      CREATE TABLE page_popups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        page_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        popup_type VARCHAR(50) NOT NULL,
        trigger VARCHAR(50) NOT NULL,
        trigger_config JSONB DEFAULT '{}',
        content JSONB NOT NULL,
        styles JSONB DEFAULT '{}',
        settings JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        "order" INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        conversions INTEGER DEFAULT 0,
        conversion_rate DECIMAL(5, 2) DEFAULT 0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP,
        FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_page_popups_tenant_id ON page_popups(tenant_id);
      CREATE INDEX idx_page_popups_page_id ON page_popups(page_id);
      CREATE INDEX idx_page_popups_is_active ON page_popups(is_active);
    `);

    // Create media_assets table
    await queryRunner.query(`
      CREATE TABLE media_assets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        filename VARCHAR(500) NOT NULL,
        asset_type VARCHAR(50) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500),
        file_size INTEGER DEFAULT 0,
        width INTEGER,
        height INTEGER,
        duration INTEGER,
        folder VARCHAR(255),
        tags TEXT[],
        alt_text TEXT,
        description TEXT,
        usage_count INTEGER DEFAULT 0,
        uploaded_by UUID NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_media_assets_tenant_id ON media_assets(tenant_id);
      CREATE INDEX idx_media_assets_asset_type ON media_assets(asset_type);
      CREATE INDEX idx_media_assets_uploaded_by ON media_assets(uploaded_by);
    `);

    // Create page_forms table
    await queryRunner.query(`
      CREATE TABLE page_forms (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        page_id UUID,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        form_type VARCHAR(50) DEFAULT 'contact',
        is_active BOOLEAN DEFAULT true,
        fields JSONB NOT NULL,
        is_multi_step BOOLEAN DEFAULT false,
        steps JSONB DEFAULT '[]',
        submit_config JSONB DEFAULT '{}',
        actions JSONB DEFAULT '[]',
        integrations JSONB DEFAULT '{}',
        enable_captcha BOOLEAN DEFAULT true,
        enable_honeypot BOOLEAN DEFAULT true,
        rate_limit INTEGER DEFAULT 5,
        views INTEGER DEFAULT 0,
        submissions INTEGER DEFAULT 0,
        completions INTEGER DEFAULT 0,
        conversion_rate DECIMAL(5, 2) DEFAULT 0,
        average_completion_time INTEGER DEFAULT 0,
        field_analytics JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP,
        FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_page_forms_tenant_id ON page_forms(tenant_id);
      CREATE INDEX idx_page_forms_page_id ON page_forms(page_id);
      CREATE INDEX idx_page_forms_form_type ON page_forms(form_type);
    `);

    // Create form_submissions table
    await queryRunner.query(`
      CREATE TABLE form_submissions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        form_id UUID NOT NULL,
        contact_id UUID,
        data JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        ip_address VARCHAR(50),
        user_agent TEXT,
        referrer VARCHAR(255),
        utm_params JSONB DEFAULT '{}',
        completion_time INTEGER,
        is_spam BOOLEAN DEFAULT false,
        processing_errors JSONB DEFAULT '[]',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP,
        FOREIGN KEY (form_id) REFERENCES page_forms(id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
      );

      CREATE INDEX idx_form_submissions_tenant_id ON form_submissions(tenant_id);
      CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);
      CREATE INDEX idx_form_submissions_contact_id ON form_submissions(contact_id);
      CREATE INDEX idx_form_submissions_status ON form_submissions(status);
    `);

    // Create page_themes table
    await queryRunner.query(`
      CREATE TABLE page_themes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(50) DEFAULT 'business',
        status VARCHAR(50) DEFAULT 'active',
        thumbnail VARCHAR(500),
        screenshots TEXT[],
        colors JSONB DEFAULT '{}',
        typography JSONB DEFAULT '{}',
        spacing JSONB DEFAULT '{}',
        border_radius JSONB DEFAULT '{}',
        shadows JSONB DEFAULT '{}',
        breakpoints JSONB DEFAULT '{}',
        buttons JSONB DEFAULT '{}',
        forms JSONB DEFAULT '{}',
        cards JSONB DEFAULT '{}',
        custom_css TEXT,
        custom_fonts JSONB DEFAULT '[]',
        global_styles JSONB DEFAULT '{}',
        components JSONB DEFAULT '{}',
        supports_dark_mode BOOLEAN DEFAULT false,
        dark_mode_colors JSONB DEFAULT '{}',
        is_public BOOLEAN DEFAULT false,
        is_featured BOOLEAN DEFAULT false,
        created_by UUID,
        usage_count INTEGER DEFAULT 0,
        tags TEXT[],
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE INDEX idx_page_themes_tenant_id ON page_themes(tenant_id);
      CREATE INDEX idx_page_themes_slug ON page_themes(slug);
      CREATE INDEX idx_page_themes_category ON page_themes(category);
      CREATE INDEX idx_page_themes_status ON page_themes(status);
      CREATE INDEX idx_page_themes_created_by ON page_themes(created_by);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS page_themes CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS form_submissions CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS page_forms CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS media_assets CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS page_popups CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS template_reviews CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS template_categories CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS page_blocks CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS page_elements CASCADE;`);
  }
}
