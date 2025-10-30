import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhancedFunnelSystem1730600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update funnel_templates table with new fields
    await queryRunner.query(`
      ALTER TABLE funnel_templates 
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS average_conversion_rate DECIMAL(5,2) DEFAULT 0
    `);

    // Create funnel_variants table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS funnel_variants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        variant_key VARCHAR(10) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        is_control BOOLEAN DEFAULT false,
        traffic_percentage INTEGER DEFAULT 50,
        visitors INTEGER DEFAULT 0,
        conversions INTEGER DEFAULT 0,
        conversion_rate DECIMAL(5,2) DEFAULT 0,
        revenue DECIMAL(15,2) DEFAULT 0,
        average_order_value DECIMAL(10,2) DEFAULT 0,
        bounce_count INTEGER DEFAULT 0,
        bounce_rate DECIMAL(5,2) DEFAULT 0,
        average_time_on_page INTEGER DEFAULT 0,
        page_overrides JSONB DEFAULT '{}',
        declared_winner_at TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_funnel_variants_funnel ON funnel_variants(funnel_id)`);
    await queryRunner.query(`CREATE INDEX idx_funnel_variants_status ON funnel_variants(status)`);

    // Create funnel_sessions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS funnel_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
        variant_id UUID REFERENCES funnel_variants(id) ON DELETE SET NULL,
        contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
        session_id VARCHAR(255) NOT NULL UNIQUE,
        status VARCHAR(50) DEFAULT 'active',
        ip_address VARCHAR(100),
        user_agent VARCHAR(500),
        device VARCHAR(255),
        browser VARCHAR(255),
        os VARCHAR(255),
        country VARCHAR(100),
        city VARCHAR(100),
        referrer VARCHAR(500),
        utm_source VARCHAR(255),
        utm_medium VARCHAR(255),
        utm_campaign VARCHAR(255),
        utm_content VARCHAR(255),
        utm_term VARCHAR(255),
        entry_page_id VARCHAR(255) NOT NULL,
        current_page_id VARCHAR(255),
        exit_page_id VARCHAR(255),
        page_views JSONB DEFAULT '[]',
        total_page_views INTEGER DEFAULT 0,
        total_time_spent INTEGER DEFAULT 0,
        converted BOOLEAN DEFAULT false,
        converted_at TIMESTAMP,
        conversion_page_id VARCHAR(255),
        conversion_value DECIMAL(15,2) DEFAULT 0,
        exit_intent_shown BOOLEAN DEFAULT false,
        exit_intent_converted BOOLEAN DEFAULT false,
        last_activity_at TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_funnel_sessions_funnel ON funnel_sessions(funnel_id)`);
    await queryRunner.query(`CREATE INDEX idx_funnel_sessions_variant ON funnel_sessions(variant_id)`);
    await queryRunner.query(`CREATE INDEX idx_funnel_sessions_session ON funnel_sessions(session_id)`);
    await queryRunner.query(`CREATE INDEX idx_funnel_sessions_status ON funnel_sessions(status)`);

    // Create funnel_events table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS funnel_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
        session_id UUID NOT NULL REFERENCES funnel_sessions(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        event_name VARCHAR(255),
        page_id VARCHAR(255),
        element_id VARCHAR(255),
        element_type VARCHAR(255),
        element_text VARCHAR(500),
        event_data JSONB DEFAULT '{}',
        is_conversion BOOLEAN DEFAULT false,
        conversion_value DECIMAL(15,2) DEFAULT 0,
        goal_id VARCHAR(255),
        event_time TIMESTAMP NOT NULL,
        time_from_start INTEGER,
        time_from_last_event INTEGER,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_funnel_events_funnel ON funnel_events(funnel_id)`);
    await queryRunner.query(`CREATE INDEX idx_funnel_events_session ON funnel_events(session_id)`);
    await queryRunner.query(`CREATE INDEX idx_funnel_events_type ON funnel_events(event_type)`);

    // Create funnel_analytics table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS funnel_analytics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
        period VARCHAR(50) NOT NULL,
        period_date DATE NOT NULL,
        variant_id VARCHAR(255),
        visitors INTEGER DEFAULT 0,
        unique_visitors INTEGER DEFAULT 0,
        page_views INTEGER DEFAULT 0,
        bounces INTEGER DEFAULT 0,
        bounce_rate DECIMAL(5,2) DEFAULT 0,
        average_time_on_site INTEGER DEFAULT 0,
        conversions INTEGER DEFAULT 0,
        conversion_rate DECIMAL(5,2) DEFAULT 0,
        revenue DECIMAL(15,2) DEFAULT 0,
        average_order_value DECIMAL(10,2) DEFAULT 0,
        source_breakdown JSONB DEFAULT '{}',
        device_breakdown JSONB DEFAULT '{}',
        page_analytics JSONB DEFAULT '[]',
        dropoff_points JSONB DEFAULT '[]',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_funnel_analytics_funnel ON funnel_analytics(funnel_id)`);
    await queryRunner.query(`CREATE INDEX idx_funnel_analytics_period ON funnel_analytics(period, period_date)`);

    // Create funnel_goals table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS funnel_goals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        is_primary BOOLEAN DEFAULT false,
        config JSONB DEFAULT '{}',
        value DECIMAL(15,2) DEFAULT 0,
        completion_count INTEGER DEFAULT 0,
        completion_rate DECIMAL(5,2) DEFAULT 0,
        total_value DECIMAL(15,2) DEFAULT 0,
        average_time_to_complete INTEGER DEFAULT 0,
        completions_by_date JSONB DEFAULT '[]',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_funnel_goals_funnel ON funnel_goals(funnel_id)`);
    await queryRunner.query(`CREATE INDEX idx_funnel_goals_type ON funnel_goals(type)`);
    await queryRunner.query(`CREATE INDEX idx_funnel_goals_status ON funnel_goals(status)`);

    // Create funnel_conditions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS funnel_conditions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
        page_id UUID,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        "order" INTEGER DEFAULT 0,
        rules JSONB NOT NULL,
        logic_operator VARCHAR(10) DEFAULT 'AND',
        actions JSONB NOT NULL,
        else_actions JSONB DEFAULT '[]',
        targeting JSONB DEFAULT '{}',
        evaluation_count INTEGER DEFAULT 0,
        passed_count INTEGER DEFAULT 0,
        failed_count INTEGER DEFAULT 0,
        pass_rate DECIMAL(5,2) DEFAULT 0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_funnel_conditions_funnel ON funnel_conditions(funnel_id)`);
    await queryRunner.query(`CREATE INDEX idx_funnel_conditions_type ON funnel_conditions(type)`);

    // Create funnel_suggestions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS funnel_suggestions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        priority VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'pending',
        title VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        reasoning TEXT,
        estimated_impact DECIMAL(5,2),
        impact_metric VARCHAR(255),
        action_steps JSONB DEFAULT '[]',
        target_page_id VARCHAR(255),
        target_element_id VARCHAR(255),
        triggering_data JSONB DEFAULT '{}',
        implemented_at TIMESTAMP,
        implemented_by VARCHAR(255),
        implementation_results JSONB DEFAULT '{}',
        dismissed_at TIMESTAMP,
        dismissal_reason VARCHAR(500),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_funnel_suggestions_funnel ON funnel_suggestions(funnel_id)`);
    await queryRunner.query(`CREATE INDEX idx_funnel_suggestions_type ON funnel_suggestions(type)`);
    await queryRunner.query(`CREATE INDEX idx_funnel_suggestions_priority ON funnel_suggestions(priority)`);
    await queryRunner.query(`CREATE INDEX idx_funnel_suggestions_status ON funnel_suggestions(status)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS funnel_suggestions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS funnel_conditions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS funnel_goals CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS funnel_analytics CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS funnel_events CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS funnel_sessions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS funnel_variants CASCADE`);
  }
}
