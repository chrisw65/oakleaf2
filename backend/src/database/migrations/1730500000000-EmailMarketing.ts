import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmailMarketing1730500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create email_templates table
    await queryRunner.query(`
      CREATE TABLE email_templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        type VARCHAR(50) DEFAULT 'marketing',
        status VARCHAR(50) DEFAULT 'draft',
        subject VARCHAR(500) NOT NULL,
        preheader VARCHAR(500),
        from_name VARCHAR(255),
        from_email VARCHAR(255),
        reply_to VARCHAR(255),
        html_content TEXT NOT NULL,
        text_content TEXT,
        mjml_content TEXT,
        variables JSONB DEFAULT '[]',
        design_settings JSONB DEFAULT '{}',
        thumbnail_url VARCHAR(500),
        usage_count INTEGER DEFAULT 0,
        last_used_at TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_email_templates_tenant ON email_templates(tenant_id)`);
    await queryRunner.query(`CREATE INDEX idx_email_templates_slug ON email_templates(slug)`);
    await queryRunner.query(`CREATE INDEX idx_email_templates_status ON email_templates(status)`);

    // Create email_campaigns table
    await queryRunner.query(`
      CREATE TABLE email_campaigns (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) DEFAULT 'broadcast',
        status VARCHAR(50) DEFAULT 'draft',
        template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        subject VARCHAR(500) NOT NULL,
        preheader VARCHAR(500),
        from_name VARCHAR(255),
        from_email VARCHAR(255),
        reply_to VARCHAR(255),
        html_content TEXT NOT NULL,
        text_content TEXT,
        scheduled_at TIMESTAMP,
        sent_at TIMESTAMP,
        segments JSONB DEFAULT '[]',
        tags JSONB DEFAULT '[]',
        send_to_all BOOLEAN DEFAULT false,
        exclude_segments JSONB DEFAULT '[]',
        exclude_tags JSONB DEFAULT '[]',
        subject_variant_b VARCHAR(500),
        html_content_variant_b TEXT,
        ab_test_percentage INTEGER,
        ab_winning_variant VARCHAR(50),
        recipient_count INTEGER DEFAULT 0,
        sent_count INTEGER DEFAULT 0,
        delivered_count INTEGER DEFAULT 0,
        opened_count INTEGER DEFAULT 0,
        clicked_count INTEGER DEFAULT 0,
        bounced_count INTEGER DEFAULT 0,
        unsubscribed_count INTEGER DEFAULT 0,
        spam_complaint_count INTEGER DEFAULT 0,
        open_rate DECIMAL(5,2) DEFAULT 0,
        click_rate DECIMAL(5,2) DEFAULT 0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_email_campaigns_tenant ON email_campaigns(tenant_id)`);
    await queryRunner.query(`CREATE INDEX idx_email_campaigns_status ON email_campaigns(status)`);
    await queryRunner.query(`CREATE INDEX idx_email_campaigns_template ON email_campaigns(template_id)`);

    // Create email_sequences table
    await queryRunner.query(`
      CREATE TABLE email_sequences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        trigger VARCHAR(50) DEFAULT 'manual',
        trigger_conditions JSONB DEFAULT '{}',
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        allow_reenrollment BOOLEAN DEFAULT false,
        reenrollment_delay INTEGER,
        stop_on_reply BOOLEAN DEFAULT true,
        stop_on_click BOOLEAN DEFAULT false,
        stop_on_unsubscribe BOOLEAN DEFAULT false,
        timezone_mode VARCHAR(50) DEFAULT 'contact_timezone',
        send_time TIME,
        send_days JSONB DEFAULT '[1,2,3,4,5]',
        active_subscribers INTEGER DEFAULT 0,
        completed_subscribers INTEGER DEFAULT 0,
        total_enrolled INTEGER DEFAULT 0,
        average_open_rate DECIMAL(5,2) DEFAULT 0,
        average_click_rate DECIMAL(5,2) DEFAULT 0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_email_sequences_tenant ON email_sequences(tenant_id)`);
    await queryRunner.query(`CREATE INDEX idx_email_sequences_status ON email_sequences(status)`);

    // Create email_sequence_steps table
    await queryRunner.query(`
      CREATE TABLE email_sequence_steps (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        position INTEGER NOT NULL,
        template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
        subject VARCHAR(500) NOT NULL,
        preheader VARCHAR(500),
        from_name VARCHAR(255),
        from_email VARCHAR(255),
        reply_to VARCHAR(255),
        html_content TEXT NOT NULL,
        text_content TEXT,
        delay_type VARCHAR(50) DEFAULT 'days',
        delay_value INTEGER DEFAULT 0,
        has_conditions BOOLEAN DEFAULT false,
        conditions JSONB DEFAULT '{}',
        sent_count INTEGER DEFAULT 0,
        delivered_count INTEGER DEFAULT 0,
        opened_count INTEGER DEFAULT 0,
        clicked_count INTEGER DEFAULT 0,
        bounced_count INTEGER DEFAULT 0,
        open_rate DECIMAL(5,2) DEFAULT 0,
        click_rate DECIMAL(5,2) DEFAULT 0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_sequence_steps_tenant ON email_sequence_steps(tenant_id)`);
    await queryRunner.query(`CREATE INDEX idx_sequence_steps_sequence ON email_sequence_steps(sequence_id)`);

    // Create email_sequence_subscribers table
    await queryRunner.query(`
      CREATE TABLE email_sequence_subscribers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
        contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'active',
        current_step INTEGER DEFAULT 0,
        next_step_at TIMESTAMP,
        enrolled_at TIMESTAMP NOT NULL,
        completed_at TIMESTAMP,
        last_email_sent_at TIMESTAMP,
        emails_sent INTEGER DEFAULT 0,
        emails_opened INTEGER DEFAULT 0,
        emails_clicked INTEGER DEFAULT 0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_sequence_subscribers_tenant ON email_sequence_subscribers(tenant_id)`);
    await queryRunner.query(`CREATE INDEX idx_sequence_subscribers_sequence ON email_sequence_subscribers(sequence_id)`);
    await queryRunner.query(`CREATE INDEX idx_sequence_subscribers_contact ON email_sequence_subscribers(contact_id)`);
    await queryRunner.query(`CREATE INDEX idx_sequence_subscribers_status ON email_sequence_subscribers(status)`);
    await queryRunner.query(`CREATE INDEX idx_sequence_subscribers_next_step ON email_sequence_subscribers(next_step_at, status)`);

    // Create email_logs table
    await queryRunner.query(`
      CREATE TABLE email_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        email_type VARCHAR(50) NOT NULL,
        campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
        sequence_id UUID REFERENCES email_sequences(id) ON DELETE SET NULL,
        sequence_step_id UUID REFERENCES email_sequence_steps(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'pending',
        recipient_email VARCHAR(255) NOT NULL,
        recipient_name VARCHAR(255),
        subject VARCHAR(500) NOT NULL,
        from_email VARCHAR(255),
        from_name VARCHAR(255),
        html_content TEXT NOT NULL,
        text_content TEXT,
        tracking_id VARCHAR(255) NOT NULL UNIQUE,
        message_id VARCHAR(255),
        sent_at TIMESTAMP,
        delivered_at TIMESTAMP,
        first_opened_at TIMESTAMP,
        last_opened_at TIMESTAMP,
        open_count INTEGER DEFAULT 0,
        first_clicked_at TIMESTAMP,
        last_clicked_at TIMESTAMP,
        click_count INTEGER DEFAULT 0,
        clicked_urls JSONB DEFAULT '[]',
        bounced_at TIMESTAMP,
        bounce_type VARCHAR(255),
        bounce_reason TEXT,
        unsubscribed_at TIMESTAMP,
        spam_complaint_at TIMESTAMP,
        variant VARCHAR(10),
        user_agent VARCHAR(500),
        ip_address VARCHAR(100),
        device VARCHAR(255),
        email_client VARCHAR(255),
        error_message TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_email_logs_tenant ON email_logs(tenant_id)`);
    await queryRunner.query(`CREATE INDEX idx_email_logs_contact ON email_logs(contact_id)`);
    await queryRunner.query(`CREATE INDEX idx_email_logs_type ON email_logs(email_type)`);
    await queryRunner.query(`CREATE INDEX idx_email_logs_campaign ON email_logs(campaign_id)`);
    await queryRunner.query(`CREATE INDEX idx_email_logs_sequence ON email_logs(sequence_id)`);
    await queryRunner.query(`CREATE INDEX idx_email_logs_status ON email_logs(status)`);
    await queryRunner.query(`CREATE INDEX idx_email_logs_tracking ON email_logs(tracking_id)`);

    // Create automation_rules table
    await queryRunner.query(`
      CREATE TABLE automation_rules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        trigger VARCHAR(100) NOT NULL,
        trigger_conditions JSONB DEFAULT '{}',
        actions JSONB NOT NULL,
        run_once BOOLEAN DEFAULT false,
        cooldown_minutes INTEGER,
        max_executions_per_contact INTEGER,
        active_days JSONB DEFAULT '[0,1,2,3,4,5,6]',
        active_time_start TIME,
        active_time_end TIME,
        execution_count INTEGER DEFAULT 0,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0,
        last_executed_at TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_automation_rules_tenant ON automation_rules(tenant_id)`);
    await queryRunner.query(`CREATE INDEX idx_automation_rules_status ON automation_rules(status)`);
    await queryRunner.query(`CREATE INDEX idx_automation_rules_trigger ON automation_rules(trigger)`);

    // Create segments table
    await queryRunner.query(`
      CREATE TABLE segments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) DEFAULT 'dynamic',
        status VARCHAR(50) DEFAULT 'active',
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        conditions JSONB DEFAULT '{}',
        contact_ids JSONB DEFAULT '[]',
        contact_count INTEGER DEFAULT 0,
        last_calculated_at TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_segments_tenant ON segments(tenant_id)`);
    await queryRunner.query(`CREATE INDEX idx_segments_status ON segments(status)`);
    await queryRunner.query(`CREATE INDEX idx_segments_type ON segments(type)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS segments CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS automation_rules CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS email_logs CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS email_sequence_subscribers CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS email_sequence_steps CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS email_sequences CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS email_campaigns CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS email_templates CASCADE`);
  }
}
