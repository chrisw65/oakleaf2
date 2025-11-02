# FRONTEND DEVELOPMENT GUIDE

## What Has Been Cataloged

Two comprehensive documents have been created to help you build a complete frontend:

### 1. BACKEND_API_CATALOG.md (Comprehensive Reference)
**Size:** 1500+ lines
**Contents:**
- Complete API endpoint documentation organized by module
- All 100+ endpoints with request/response examples
- Required permissions for each endpoint
- All DTOs and entity types
- Authentication flow details
- Error handling codes
- Entity relationships map
- Implementation notes

**Use this when:** Building specific features, integrating with backend, checking endpoint details

### 2. BACKEND_QUICK_REFERENCE.md (Quick Lookup)
**Size:** 250+ lines
**Contents:**
- High-level architecture overview
- Module summaries
- Common query parameters
- Permission system overview
- Status codes and enums
- Request/response patterns
- Frontend integration checklist

**Use this when:** Quick lookups, understanding architecture, checking common patterns

---

## BACKEND MODULES SUMMARY

### 16 Major Feature Modules

1. **AUTH** - Registration, login, JWT management
   - 7 endpoints (2 TODO)
   - Public access for register/login

2. **RBAC** (Roles & Permissions)
   - Roles: 12 endpoints
   - Permissions: 9 endpoints
   - Full role and permission management

3. **CRM** (Customer Relationship Management)
   - Contacts: 12 endpoints
   - Opportunities: 10 endpoints
   - Pipelines: 11 endpoints
   - Tags: 5 endpoints
   - Total: 38 endpoints

4. **ORDERS** (E-commerce)
   - Products: 8 endpoints
   - Cart: 5 endpoints
   - Orders: 8 endpoints
   - Total: 21 endpoints

5. **EMAIL** (Email Marketing)
   - Email Campaigns: 7 endpoints
   - Email Templates: 13 endpoints
   - Email Sequences: 9 endpoints
   - Segments: 5 endpoints
   - Total: 34 endpoints

6. **FUNNELS** (Sales Funnels)
   - Funnels: 10 endpoints
   - Pages: 8 endpoints
   - Page Elements/Blocks/Forms/Popups/Themes
   - Total: 18+ endpoints

7. **AFFILIATE** (Affiliate Marketing)
   - Affiliates: 15 endpoints
   - Commissions: 9 endpoints
   - Payouts: TBD
   - Total: 24+ endpoints

8. **ANALYTICS** - Event tracking, revenue, funnel metrics
   - 14 endpoints

9. **WEBHOOKS** - Webhook management and delivery
   - 11 endpoints

10. **ADMIN** - Dashboard and system stats
    - 6 endpoints

11. **AUDIT** - Audit logs and compliance
    - 8 endpoints

12. **PAYMENTS** - Stripe integration
    - 5 endpoints

13. **2FA** - Two-factor authentication
    - 6 endpoints

14. **API_KEYS** - API key management
    - 6 endpoints

15. **FILES** - File upload and management
    - 8 endpoints

16. **CUSTOM_DOMAINS** - Custom domain management
    - 10 endpoints

### Additional Modules
- Notifications (8 endpoints)
- A/B Testing (8 endpoints)
- Email Templates (dedicated module)
- Email Automation (sequences)

**TOTAL: 200+ API endpoints across 16+ modules**

---

## WHAT YOU NEED TO BUILD IN FRONTEND

### Core Application Pages

#### Authentication (Public)
- [ ] Login page
- [ ] Register page
- [ ] Forgot password page (TODO: backend)
- [ ] Password reset page (TODO: backend)
- [ ] Email verification page (TODO: backend)

#### Main Dashboard
- [ ] User dashboard (role-based)
- [ ] Admin dashboard with system stats
- [ ] Analytics dashboard

#### CRM Features
- [ ] Contacts list and CRUD
- [ ] Contact detail page
- [ ] Contact tagging interface
- [ ] Contact import/export
- [ ] Opportunities board (kanban)
- [ ] Pipeline management
- [ ] Lead scoring interface
- [ ] Contact search and filtering

#### Sales & Products
- [ ] Product catalog
- [ ] Product management (CRUD)
- [ ] Shopping cart
- [ ] Checkout flow
- [ ] Order management
- [ ] Order history
- [ ] Refund management

#### Email Marketing
- [ ] Email campaign builder
- [ ] Email template library
- [ ] Template editor
- [ ] Email sequence builder
- [ ] Segment/list management
- [ ] Campaign statistics/analytics
- [ ] Subscriber management

#### Funnel Builder
- [ ] Funnel list and management
- [ ] Visual funnel builder
- [ ] Drag-and-drop page editor
- [ ] Page element library
- [ ] Theme customization
- [ ] A/B test variants
- [ ] Funnel analytics/stats

#### Affiliate Program
- [ ] Affiliate dashboard
- [ ] Commission tracking
- [ ] Link generation
- [ ] Performance analytics
- [ ] Payout request management
- [ ] Affiliate admin panel (for admins)
- [ ] Approval workflow

#### Settings & Configuration
- [ ] User profile management
- [ ] 2FA setup
- [ ] API keys management
- [ ] Custom domain setup
- [ ] Webhook configuration
- [ ] Role and permission management
- [ ] User management (for admins)

#### Admin Features
- [ ] System dashboard
- [ ] Audit logs
- [ ] User management
- [ ] Role/permission editor
- [ ] System health monitoring
- [ ] Tenant management (super admin)
- [ ] Analytics export

#### Analytics
- [ ] Event tracking setup
- [ ] Revenue analytics
- [ ] Funnel conversion metrics
- [ ] UTM tracking
- [ ] Geographic data visualization
- [ ] Device breakdown
- [ ] Real-time metrics dashboard
- [ ] Custom reports

#### Notifications
- [ ] Notification center
- [ ] Unread notification badge
- [ ] Real-time notification updates (WebSocket)
- [ ] Notification preferences

#### File Management
- [ ] File uploader
- [ ] Media library
- [ ] File browser
- [ ] Presigned URL handling

---

## AUTHENTICATION FLOW

```
1. User registers/logs in
   POST /auth/register or /auth/login
   Receive: { accessToken, refreshToken, user }

2. Store tokens (localStorage/sessionStorage)

3. All subsequent requests:
   Authorization: Bearer <accessToken>

4. When token expires:
   POST /auth/refresh with { refreshToken }
   Get new accessToken

5. Check user permissions:
   - User.roles -> check capabilities
   - Verify permissions for sensitive actions
   
6. Redirect unauthorized access:
   - 401 -> redirect to login
   - 403 -> show permission denied
```

---

## TENANT ISOLATION

This is a **multi-tenant system**:

```
- Each user belongs to ONE tenant
- All data is tenant-scoped
- Tenant ID is auto-extracted from JWT
- Frontend should NOT manually set tenant ID

When you login:
- JWT contains tenantId
- Backend extracts it for all requests
- All your data is filtered by this tenant
```

---

## KEY INTEGRATION POINTS

### 1. API Client Architecture
```typescript
// Create a service layer
- ApiClient service (with interceptors)
  - Add JWT to headers
  - Handle 401/403 errors
  - Request/response transformation
  
- Feature-specific services
  - ContactsService (calls ContactsAPI)
  - FunnelsService (calls FunnelsAPI)
  - etc.
```

### 2. State Management
```
Options: Redux, Zustand, Pinia, Recoil

Minimum state needed:
- Auth (user, tokens, permissions)
- CRM (contacts, opportunities, pipelines)
- Funnels (funnels, pages)
- Email (campaigns, templates, sequences)
- Orders (products, orders, cart)
```

### 3. Real-Time Features
```
WebSocket needed for:
- Notifications (GET /notifications/connection/status)
- Live analytics (real-time metrics)
- Funnel conversion tracking
```

### 4. Permissions Handling
```typescript
// Check before showing UI
canCreate('funnel') -> Check user permissions
canDelete('contact') -> Based on role/permissions

Types:
- role-based (simple)
- permission-based (granular) <- Backend supports this
```

### 5. Form Validation
```
Frontend validation:
- Required fields
- Email format
- URL format
- etc.

Backend validation:
- Business logic
- Uniqueness constraints (slug, email)
- Permission checks
```

---

## TECHNOLOGY RECOMMENDATIONS

### Frontend Framework
- **React** with TypeScript (most common)
- **Vue 3** with Composition API
- **Next.js** for full-stack

### State Management
- Redux Toolkit (if React)
- Pinia (if Vue)
- Zustand (lightweight alternative)

### UI Component Library
- Material-UI
- Tailwind CSS
- Ant Design
- Shadcn/ui

### Form Libraries
- React Hook Form + Zod
- Formik
- Vee-validate (Vue)

### HTTP Client
- Axios
- Fetch API
- TanStack Query (formerly React Query)

### Charts/Analytics
- Chart.js
- Recharts
- Apache ECharts

### Page Builder
- GrapeJS
- Penpot
- Or build custom with React

### Email Editor
- Mjml-based editor
- Custom rich text editor
- React-email

### Date/Time
- Day.js (lightweight)
- Date-fns

---

## TESTING ENDPOINTS

Before building UI, test endpoints with:
- **Postman** - Interactive API testing
- **Insomnia** - API client
- **cURL** - Command line
- **Thunder Client** - VS Code extension

---

## COMMON PITFALLS TO AVOID

1. **Forgetting to check permissions** before enabling features
2. **Not handling 401/403 errors** properly
3. **Missing pagination** on list endpoints
4. **Hardcoding tenant ID** instead of extracting from JWT
5. **Not storing/refreshing tokens** properly
6. **Missing error handling** and user feedback
7. **Building without understanding entity relationships**
8. **Not implementing proper file upload** for presigned URLs
9. **Ignoring rate limiting** - add debouncing
10. **Building sequentially instead of in parallel** with backend team

---

## NEXT STEPS

1. Choose your frontend framework
2. Setup API client service layer
3. Implement authentication flow
4. Start building dashboard
5. Implement CRM features (contacts, opportunities)
6. Build funnel/page builder
7. Add email marketing features
8. Implement analytics
9. Add admin controls
10. Testing and refinement

---

## DOCUMENTATION FILES

In your project root:
- `/BACKEND_API_CATALOG.md` - Complete API reference (1500+ lines)
- `/BACKEND_QUICK_REFERENCE.md` - Quick lookup guide (250+ lines)
- `/FRONTEND_DEVELOPMENT_GUIDE.md` - This file

---

**Total Backend Endpoints Documented: 200+**
**All features covered for complete frontend implementation**
