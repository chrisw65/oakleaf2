# BACKEND API QUICK REFERENCE GUIDE

## Overview
This backend is a comprehensive multi-tenant SaaS platform built with NestJS supporting:
- User authentication & authorization (JWT + RBAC)
- CRM management (contacts, opportunities, pipelines)
- Sales funnels with page builder
- Email marketing (campaigns, sequences, templates)
- Product & order management
- Affiliate marketing program
- Payment processing (Stripe)
- Real-time analytics
- Admin controls & audit logs

## Core Architecture
- **Framework:** NestJS
- **Database:** TypeORM with PostgreSQL
- **Authentication:** JWT + Local strategy
- **Guards:** JwtAuthGuard, RolesGuard, PermissionsGuard
- **Queue:** Bull (background jobs)
- **Cache:** Distributed caching
- **Rate Limiting:** 100 requests/minute globally

## API Base Structure
- Base URL: `http://localhost:3000/api` (or production domain)
- All endpoints protected by JWT (except @Public marked endpoints)
- Tenant-scoped: All operations are tenant-isolated
- Response format: Standard JSON with success/data/message fields

## Authentication
**Public Endpoints (No Auth Required):**
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/verify-email (TODO)
- POST /auth/forgot-password (TODO)
- POST /auth/reset-password (TODO)
- POST /payments/webhook (Stripe only)

**Protected Endpoints:**
- All other endpoints require valid JWT token in Authorization header
- Format: `Authorization: Bearer <token>`

## Key Modules & Their Primary Endpoints

### 1. Authentication & Authorization
- `/auth` - Login, register, token refresh
- `/roles` - Role management
- `/permissions` - Permission management
- `/2fa` - Two-factor authentication

### 2. CRM
- `/contacts` - Contact CRUD, tagging, scoring
- `/opportunities` - Sales opportunities, pipeline stages
- `/pipelines` - Pipeline configuration
- `/tags` - Contact tagging system

### 3. Sales & Orders
- `/products` - Product management
- `/cart` - Shopping cart
- `/orders` - Order management & fulfillment

### 4. Email Marketing
- `/email-campaigns` - Email campaigns
- `/email-templates` - Email template library
- `/email-sequences` - Automated email sequences
- `/segments` - Contact segmentation

### 5. Funnels & Pages
- `/funnels` - Funnel creation & management
- `/pages` - Page builder & page elements

### 6. Affiliate Program
- `/affiliates` - Affiliate registration & management
- `/commissions` - Commission tracking
- `/payouts` - Payout management (TBD)

### 7. Analytics & Events
- `/analytics` - Event tracking, revenue, conversion analytics
- `/webhooks` - Webhook configuration & management

### 8. Admin & Settings
- `/admin` - Dashboard & system health
- `/audit` - Audit logs
- `/custom-domains` - Custom domain management
- `/api-keys` - API key management
- `/files` - File upload & management
- `/notifications` - User notifications

## Common Query Parameters

**Pagination:**
- `limit` - Items per page (default: 50)
- `offset` or `page` - Starting position

**Filtering:**
- `status` - Filter by status
- `search` - Full-text search
- `startDate`, `endDate` - Date range filtering
- `category`, `type` - Category/type filtering

**Sorting:**
- `sort` - Sort field
- `order` - 'asc' or 'desc'

## Permission System

**System Permissions (auto-created):**
- `role:create`, `role:read`, `role:update`, `role:delete`
- `funnel:create`, `funnel:read`, `funnel:update`, `funnel:delete`
- `order:create`, `order:read`, `order:update`, `order:refund`
- `email_templates:create`, `email_templates:read`, `email_templates:update`, `email_templates:delete`
- `settings:read`, `settings:update`
- `analytics:read`, `analytics:export`
- Plus many others...

**User Roles:**
- `SUPER_ADMIN` - Full system access
- `ADMIN` - Administrative access to tenant
- `USER` - Standard user access
- `AFFILIATE` - Affiliate program access
- `MEMBER` - Limited member access

## Common Request Patterns

### Create Resource
```
POST /resource
Content-Type: application/json
Authorization: Bearer <token>

{
  "field1": "value1",
  "field2": "value2"
}

Response: 201 Created
{ "success": true, "data": {...}, "message": "..." }
```

### List Resources
```
GET /resource?limit=50&offset=0&search=term
Authorization: Bearer <token>

Response: 200 OK
{ "success": true, "data": [...], "total": 100, "page": 1, "limit": 50 }
```

### Get Single Resource
```
GET /resource/:id
Authorization: Bearer <token>

Response: 200 OK
{ "success": true, "data": {...} }
```

### Update Resource
```
PUT /resource/:id
Content-Type: application/json
Authorization: Bearer <token>

{ "field1": "newValue" }

Response: 200 OK
{ "success": true, "data": {...}, "message": "..." }
```

### Delete Resource
```
DELETE /resource/:id
Authorization: Bearer <token>

Response: 204 No Content (or 200 with success message)
```

## Status Codes

- `200` - OK (GET, PUT)
- `201` - Created (POST)
- `204` - No Content (DELETE successful)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid JWT)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Server Error

## Entity Key Relationships

```
User -> Tenant (multi-tenant isolation)
Contact -> Tags, Opportunities, Segments
Order -> OrderItems -> Products
Funnel -> Pages -> Page Elements, Blocks, Forms
EmailCampaign -> EmailTemplate, Segment, EmailLogs
Affiliate -> Commissions, Payouts
```

## Key Enums & Constants

**Funnel Types:** LEAD_GENERATION, SALES, WEBINAR, PRODUCT_LAUNCH, MEMBERSHIP, TRIPWIRE, VSL, APPLICATION, SURVEY, CUSTOM

**Funnel Status:** DRAFT, ACTIVE, PAUSED, ARCHIVED

**Order Status:** PENDING, PROCESSING, COMPLETED, CANCELLED, REFUNDED

**Campaign Status:** DRAFT, SCHEDULED, SENDING, SENT, PAUSED, CANCELLED, ARCHIVED

**Affiliate Status:** PENDING, APPROVED, REJECTED, SUSPENDED, ACTIVE

**Commission Status:** PENDING, APPROVED, REJECTED, PAID

**User Roles:** SUPER_ADMIN, ADMIN, USER, AFFILIATE, MEMBER

**User Status:** ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION

## Frontend Integration Checklist

- [ ] Implement JWT token storage (localStorage/sessionStorage)
- [ ] Add authorization header to all API calls
- [ ] Handle 401 responses (token refresh or redirect to login)
- [ ] Implement permission checks before enabling UI features
- [ ] Add role-based view rendering
- [ ] Setup WebSocket for real-time notifications
- [ ] Implement request pagination for list pages
- [ ] Add proper error handling with user-friendly messages
- [ ] Setup API request interceptors/middleware
- [ ] Implement request debouncing for rate limiting
- [ ] Create API client/service layer abstraction
- [ ] Handle form submissions with proper DTOs
- [ ] Setup Analytics event tracking
- [ ] Implement file upload with presigned URLs

## Important Implementation Notes

1. **Tenant Isolation:** Always include tenant ID in requests via @GetTenant decorator
2. **Permissions:** Check user permissions before allowing sensitive operations
3. **Error Messages:** API returns specific error messages for debugging
4. **Pagination:** Most list endpoints require pagination (limit/offset)
5. **Filtering:** Use query params for filtering, not URL segments
6. **File Upload:** Use presigned URLs for large files (100MB max)
7. **Real-time:** WebSocket connection for notifications on /notifications endpoint
8. **Webhooks:** Implement signature verification for incoming webhooks
9. **Rate Limiting:** Frontend should implement request debouncing
10. **Caching:** Use appropriate cache headers and client-side caching

## Complete Documentation Location
See: `/home/user/oakleaf2/BACKEND_API_CATALOG.md`

This comprehensive 1500+ line document contains:
- All 100+ API endpoints
- All request/response formats
- All DTOs and entities
- All permissions and roles
- All status enums
- Complete examples for each feature area
