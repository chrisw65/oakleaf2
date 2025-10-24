# Technical Architecture

## System Overview

The platform follows a **modular monolith** architecture initially, with clear service boundaries that can be extracted into microservices as scale demands. This approach balances development speed with future scalability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CDN Layer                             │
│                  (CloudFlare / CloudFront)                   │
│              Static Assets + Funnel Pages Cache              │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────────┐
│                    Load Balancer                             │
│                 (nginx / AWS ALB)                            │
└─────────┬──────────────────────┬────────────────────────────┘
          │                      │
┌─────────┴────────────┐  ┌─────┴────────────────────────────┐
│   Frontend SPA       │  │    Backend API Servers           │
│   (React + TS)       │  │    (Node.js / Python)            │
│                      │  │                                  │
│  - Admin Dashboard   │  │  ┌──────────────────────────┐   │
│  - Funnel Builder    │  │  │   API Gateway Layer      │   │
│  - Affiliate Portal  │  │  │   - Auth Middleware      │   │
│                      │  │  │   - Rate Limiting        │   │
└──────────────────────┘  │  │   - Request Validation   │   │
                          │  └──────────┬───────────────┘   │
                          │             │                     │
                          │  ┌──────────┴───────────────┐   │
                          │  │   Core Services          │   │
                          │  │                          │   │
                          │  │  ┌────────────────────┐  │   │
                          │  │  │ Funnel Service     │  │   │
                          │  │  │ - Page Builder     │  │   │
                          │  │  │ - Template Mgmt    │  │   │
                          │  │  │ - Form Processing  │  │   │
                          │  │  └────────────────────┘  │   │
                          │  │                          │   │
                          │  │  ┌────────────────────┐  │   │
                          │  │  │ Affiliate Service  │  │   │
                          │  │  │ - Tracking Engine  │  │   │
                          │  │  │ - Commission Calc  │  │   │
                          │  │  │ - Payout Mgmt      │  │   │
                          │  │  └────────────────────┘  │   │
                          │  │                          │   │
                          │  │  ┌────────────────────┐  │   │
                          │  │  │ CRM Service        │  │   │
                          │  │  │ - Contact Mgmt     │  │   │
                          │  │  │ - Pipeline Mgmt    │  │   │
                          │  │  │ - Segmentation     │  │   │
                          │  │  └────────────────────┘  │   │
                          │  │                          │   │
                          │  │  ┌────────────────────┐  │   │
                          │  │  │ Automation Engine  │  │   │
                          │  │  │ - Workflow Builder │  │   │
                          │  │  │ - Trigger System   │  │   │
                          │  │  │ - Action Executor  │  │   │
                          │  │  └────────────────────┘  │   │
                          │  │                          │   │
                          │  │  ┌────────────────────┐  │   │
                          │  │  │ Messaging Service  │  │   │
                          │  │  │ - Email Queue      │  │   │
                          │  │  │ - SMS Queue        │  │   │
                          │  │  │ - Delivery Track   │  │   │
                          │  │  └────────────────────┘  │   │
                          │  │                          │   │
                          │  │  ┌────────────────────┐  │   │
                          │  │  │ Analytics Service  │  │   │
                          │  │  │ - Event Tracking   │  │   │
                          │  │  │ - Report Generator │  │   │
                          │  │  │ - AI Insights      │  │   │
                          │  │  └────────────────────┘  │   │
                          │  └──────────────────────────┘   │
                          └──────────────┬───────────────────┘
                                        │
┌───────────────────────────────────────┴─────────────────────┐
│                    Message Queue Layer                       │
│                   (Redis + Bull Queue)                       │
│  - Email Jobs  - SMS Jobs  - Webhook Jobs  - Analytics Jobs  │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────┴─────────────────────────────┐
│                      Data Layer                              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ PostgreSQL   │  │    Redis     │  │  Elasticsearch  │  │
│  │              │  │              │  │                 │  │
│  │ - Users      │  │ - Sessions   │  │ - Analytics     │  │
│  │ - Funnels    │  │ - Cache      │  │ - Search Index  │  │
│  │ - Contacts   │  │ - Rate Limit │  │ - Logs          │  │
│  │ - Orders     │  │ - Job Queue  │  └─────────────────┘  │
│  │ - Affiliates │  └──────────────┘                        │
│  │ - Workflows  │                                          │
│  └──────────────┘                                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Object Storage (S3)                      │  │
│  │  - Uploads  - Templates  - Assets  - Exports         │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                 External Services                             │
│                                                              │
│  - Stripe/PayPal (Payments)                                  │
│  - Twilio (SMS/Voice)                                        │
│  - SendGrid/SES (Email)                                      │
│  - OpenAI (AI Features)                                      │
└──────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend Architecture

#### Technology Stack
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit for global state, React Query for server state
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Page Builder**: Custom implementation using GrapeJS or Craft.js
- **Forms**: React Hook Form + Zod validation
- **Real-time**: Socket.io for live updates

#### Module Structure
```
frontend/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   ├── funnels/
│   │   │   ├── builder/
│   │   │   ├── templates/
│   │   │   └── analytics/
│   │   ├── affiliates/
│   │   │   ├── dashboard/
│   │   │   ├── tracking/
│   │   │   └── payouts/
│   │   ├── crm/
│   │   │   ├── contacts/
│   │   │   ├── pipelines/
│   │   │   └── activities/
│   │   ├── automation/
│   │   │   ├── workflows/
│   │   │   └── campaigns/
│   │   └── settings/
│   ├── components/
│   │   ├── ui/ (shared UI components)
│   │   └── layout/
│   ├── hooks/
│   ├── utils/
│   ├── services/ (API clients)
│   └── types/
```

### 2. Backend Architecture

#### Technology Choice: Node.js with NestJS

**Rationale**:
- TypeScript end-to-end consistency
- Built-in dependency injection
- Modular architecture by design
- Strong typing and decorator-based development
- Excellent ecosystem for enterprise applications

#### Module Structure
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── strategies/ (JWT, OAuth)
│   │   │   └── guards/
│   │   ├── funnel/
│   │   │   ├── funnel.module.ts
│   │   │   ├── funnel.service.ts
│   │   │   ├── funnel.controller.ts
│   │   │   ├── page.service.ts
│   │   │   ├── template.service.ts
│   │   │   └── entities/
│   │   ├── affiliate/
│   │   │   ├── affiliate.module.ts
│   │   │   ├── tracking.service.ts
│   │   │   ├── commission.service.ts
│   │   │   ├── payout.service.ts
│   │   │   └── entities/
│   │   ├── crm/
│   │   │   ├── crm.module.ts
│   │   │   ├── contact.service.ts
│   │   │   ├── pipeline.service.ts
│   │   │   ├── activity.service.ts
│   │   │   └── entities/
│   │   ├── automation/
│   │   │   ├── automation.module.ts
│   │   │   ├── workflow.service.ts
│   │   │   ├── trigger.service.ts
│   │   │   ├── action-executor.service.ts
│   │   │   └── entities/
│   │   ├── messaging/
│   │   │   ├── messaging.module.ts
│   │   │   ├── email.service.ts
│   │   │   ├── sms.service.ts
│   │   │   └── providers/
│   │   ├── analytics/
│   │   │   ├── analytics.module.ts
│   │   │   ├── event-tracking.service.ts
│   │   │   ├── report.service.ts
│   │   │   └── entities/
│   │   ├── payment/
│   │   │   ├── payment.module.ts
│   │   │   ├── stripe.service.ts
│   │   │   ├── paypal.service.ts
│   │   │   └── webhook.controller.ts
│   │   └── tenant/
│   │       ├── tenant.module.ts
│   │       ├── tenant.service.ts
│   │       └── tenant.middleware.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── app.config.ts
│   └── main.ts
```

### 3. Database Schema Design

#### Core Entities

```sql
-- Multi-tenancy
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    custom_domain VARCHAR(255),
    plan VARCHAR(50) NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users & Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL, -- admin, user, affiliate
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

-- Funnels
CREATE TABLE funnels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, archived
    type VARCHAR(100), -- lead_gen, sales, webinar, etc.
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, slug)
);

-- Funnel Pages
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- opt-in, sales, upsell, downsell, thank-you
    position INTEGER NOT NULL,
    content JSONB NOT NULL, -- Page builder JSON
    seo_settings JSONB DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts (CRM)
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255),
    phone VARCHAR(50),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    custom_fields JSONB DEFAULT '{}',
    tags TEXT[], -- Array of tags
    source VARCHAR(100), -- funnel, import, api
    affiliate_id UUID, -- FK added later
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_contacts_tenant_email ON contacts(tenant_id, email);
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);

-- Pipelines
CREATE TABLE pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    stages JSONB NOT NULL, -- Array of stage objects
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Opportunities
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    pipeline_id UUID REFERENCES pipelines(id),
    stage VARCHAR(100),
    value DECIMAL(10, 2),
    status VARCHAR(50), -- open, won, lost
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Affiliates
CREATE TABLE affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    affiliate_code VARCHAR(50) UNIQUE NOT NULL,
    parent_affiliate_id UUID REFERENCES affiliates(id), -- For multi-tier
    commission_plan_id UUID,
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended
    total_earnings DECIMAL(10, 2) DEFAULT 0,
    total_paid DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commission Plans
CREATE TABLE commission_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- percentage, fixed
    tier1_rate DECIMAL(5, 2), -- First tier commission
    tier2_rate DECIMAL(5, 2), -- Second tier commission
    cookie_duration_days INTEGER DEFAULT 30,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate Clicks
CREATE TABLE affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
    visitor_id VARCHAR(255), -- Cookie/session ID
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    landing_page VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_clicks_affiliate_date ON affiliate_clicks(affiliate_id, created_at);

-- Affiliate Commissions
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
    order_id UUID, -- FK to orders
    tier INTEGER DEFAULT 1, -- 1 for direct, 2 for sub-affiliate
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, paid, rejected
    approved_at TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_commissions_affiliate_status ON commissions(affiliate_id, status);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id),
    affiliate_id UUID REFERENCES affiliates(id),
    funnel_id UUID REFERENCES funnels(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50), -- pending, completed, refunded
    payment_method VARCHAR(50),
    payment_id VARCHAR(255), -- External payment processor ID
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflows
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(100), -- form_submit, tag_added, purchase, etc.
    trigger_config JSONB,
    steps JSONB NOT NULL, -- Array of workflow steps
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Executions
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    current_step INTEGER DEFAULT 0,
    status VARCHAR(50), -- running, completed, failed, paused
    context JSONB DEFAULT '{}',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Analytics Events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(100), -- page_view, form_submit, purchase, etc.
    entity_type VARCHAR(50), -- funnel, page, email
    entity_id UUID,
    contact_id UUID,
    affiliate_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_events_tenant_type_date ON analytics_events(tenant_id, event_type, created_at);
```

### 4. Affiliate Tracking Mechanism

#### Flow Diagram
```
1. Affiliate Link Click
   ↓
2. Set Cookie (affiliate_id, expires in X days)
   ↓
3. Redirect to Funnel Page
   ↓
4. Log Click Event (affiliate_clicks table)
   ↓
5. User Browses Funnel
   ↓
6. User Submits Form / Makes Purchase
   ↓
7. Check for Affiliate Cookie
   ↓
8. If Found: Associate Contact/Order with Affiliate
   ↓
9. Calculate Commission (immediate for leads, delayed for sales)
   ↓
10. Create Commission Record
    ↓
11. Update Affiliate Dashboard (real-time via WebSocket)
```

#### Implementation Details

**Tracking Service**:
```typescript
@Injectable()
export class AffiliateTrackingService {
  async recordClick(affiliateCode: string, request: Request) {
    const affiliate = await this.findByCode(affiliateCode);

    // Log click
    await this.clickRepository.create({
      affiliate_id: affiliate.id,
      visitor_id: this.getVisitorId(request),
      ip_address: request.ip,
      user_agent: request.headers['user-agent'],
      referrer: request.headers.referer,
      landing_page: request.query.redirect || '/'
    });

    // Set cookie
    const cookieExpiry = affiliate.commission_plan.cookie_duration_days;
    response.cookie('aff_ref', affiliate.id, {
      maxAge: cookieExpiry * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    });
  }

  async attributeConversion(contactId: UUID, orderId: UUID, request: Request) {
    const affiliateId = request.cookies['aff_ref'];
    if (!affiliateId) return;

    const affiliate = await this.findById(affiliateId);
    const order = await this.orderService.findById(orderId);

    // Calculate commission
    const commission = await this.calculateCommission(
      affiliate,
      order.total_amount
    );

    // Create commission record
    await this.commissionRepository.create({
      tenant_id: order.tenant_id,
      affiliate_id: affiliate.id,
      order_id: orderId,
      tier: 1,
      amount: commission,
      status: 'pending'
    });

    // Handle second-tier if applicable
    if (affiliate.parent_affiliate_id) {
      await this.createSecondTierCommission(
        affiliate.parent_affiliate_id,
        order,
        commission
      );
    }

    // Emit real-time update
    this.eventEmitter.emit('affiliate.conversion', {
      affiliate_id: affiliateId,
      amount: commission
    });
  }
}
```

### 5. Scalability Considerations

#### Horizontal Scaling
- **Stateless API servers**: All session data in Redis
- **Load balancing**: Round-robin or least-connections
- **Database read replicas**: For analytics and reporting queries
- **Job queue workers**: Scale workers based on queue depth

#### Caching Strategy
- **Redis layers**:
  - L1: Hot data (funnel pages, templates)
  - L2: Session data
  - L3: Rate limiting counters
- **CDN**: Static assets and published funnel pages
- **Database query cache**: PostgreSQL materialized views for reports

#### Performance Optimization
- **Connection pooling**: Database connection reuse
- **Lazy loading**: Frontend code splitting
- **Indexed queries**: All foreign keys and common filters
- **Batch processing**: Bulk email/SMS via queue system
- **WebSocket**: Real-time updates without polling

### 6. Security Architecture

#### Authentication Flow
```
1. User Login Request
   ↓
2. Validate Credentials
   ↓
3. Generate JWT Access Token (15 min expiry)
   ↓
4. Generate Refresh Token (7 days)
   ↓
5. Store Refresh Token in Redis
   ↓
6. Return Both Tokens
   ↓
7. Client Stores Access Token (memory) + Refresh Token (httpOnly cookie)
   ↓
8. API Requests Include Access Token
   ↓
9. On Access Token Expiry → Use Refresh Token to Get New Access Token
```

#### Security Measures
- **Password hashing**: Argon2 or bcrypt with salt
- **JWT signing**: RS256 (asymmetric) for production
- **Rate limiting**: Redis-backed, per-IP and per-user
- **CORS**: Whitelist allowed origins
- **SQL injection**: Parameterized queries only (ORM)
- **XSS protection**: Content Security Policy headers
- **CSRF**: Double-submit cookie pattern
- **Encryption at rest**: Database-level encryption
- **Secrets management**: Environment variables + Vault

#### Multi-Tenancy Isolation
- **Row-level security**: Every query filtered by tenant_id
- **Middleware**: Automatic tenant_id injection
- **Data validation**: Ensure cross-tenant access impossible
- **API keys**: Tenant-scoped for external integrations

### 7. Monitoring & Observability

#### Key Metrics
- **API Performance**: Response times (p50, p95, p99)
- **Error Rates**: 4xx and 5xx by endpoint
- **Database**: Connection pool usage, slow queries
- **Queue**: Job processing time, failure rates
- **Business**: Funnels created, orders processed, affiliate conversions

#### Tools
- **Application**: Prometheus + Grafana
- **Logging**: Winston → Elasticsearch → Kibana
- **Tracing**: OpenTelemetry
- **Alerts**: PagerDuty / Slack webhooks
- **Uptime**: UptimeRobot or internal health checks

---

## Development Standards

### Code Quality
- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Unit test coverage: >80%
- Integration tests for critical paths
- E2E tests for user flows

### Git Workflow
- Feature branches from `develop`
- PR reviews required
- CI/CD on merge to `develop`
- Staging deployment for QA
- Production deployment from `main`

### Documentation
- API documentation: Swagger/OpenAPI
- Code comments for complex logic
- Architecture decision records (ADRs)
- User documentation: Markdown + Docusaurus

---

**Next**: See `DATABASE_SCHEMA.md` for detailed schema, `API_SPEC.md` for API documentation.
