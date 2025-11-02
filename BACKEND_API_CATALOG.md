# COMPREHENSIVE BACKEND API CATALOG

## AUTHENTICATION & AUTHORIZATION

### Auth Module (`/auth`)
**Base Path:** `/auth`
**Authentication:** Public endpoints (no JWT required)

#### Endpoints:
- `POST /auth/register` - Register new user
  - Body: RegisterDto (email, password, firstName, lastName)
  - Returns: User object with JWT tokens

- `POST /auth/login` - Login user
  - Body: LoginDto (email, password)
  - Returns: User object with access/refresh tokens

- `POST /auth/refresh` - Refresh access token
  - Body: { refreshToken: string }
  - Returns: New JWT tokens

- `POST /auth/logout` - Logout user
  - Protected: JWT
  - Returns: Success message

- `POST /auth/verify-email` - Verify email token
  - Body: { token: string }
  - TODO: Email verification not yet implemented

- `POST /auth/forgot-password` - Request password reset
  - Body: { email: string }
  - TODO: Forgot password not yet implemented

- `POST /auth/reset-password` - Reset password with token
  - Body: { token: string, password: string }
  - TODO: Reset password not yet implemented

**Roles/Permissions:** Public
**Key DTOs:** RegisterDto, LoginDto

---

## RBAC (Role-Based Access Control)

### Permissions Module (`/permissions`)
**Base Path:** `/permissions`
**Authentication:** JWT + Permission Guard
**Required Permission:** `role:read` or `role:create`

#### Endpoints:
- `POST /permissions` - Create new permission
  - Required Permission: `role:create`
  - Body: CreatePermissionDto
  - Returns: Permission object

- `GET /permissions` - Get all permissions
  - Required Permission: `role:read`
  - Query: ?resource=string, ?category=string
  - Returns: List of permissions

- `GET /permissions/categories` - Get permission categories
  - Required Permission: `role:read`
  - Returns: Array of category strings

- `GET /permissions/:id` - Get permission by ID
  - Required Permission: `role:read`
  - Returns: Permission object

- `PUT /permissions/:id` - Update permission
  - Required Permission: `role:update`
  - Body: UpdatePermissionDto
  - Returns: Updated permission

- `DELETE /permissions/:id` - Delete permission
  - Required Permission: `role:delete`
  - Returns: No content

- `POST /permissions/bulk` - Bulk create permissions
  - Required Permission: `role:create`
  - Body: { permissions: CreatePermissionDto[] }
  - Returns: Array of created permissions

- `POST /permissions/initialize` - Initialize system permissions
  - Required Permission: `role:create`
  - Returns: Array of initialized system permissions

**Key Entities:** Permission
**Key DTOs:** CreatePermissionDto, UpdatePermissionDto

---

### Roles Module (`/roles`)
**Base Path:** `/roles`
**Authentication:** JWT + Permission Guard
**Required Permission:** `role:read`, `role:create`, `role:update`, `role:delete`

#### Endpoints:
- `POST /roles` - Create new role
  - Required Permission: `role:create`
  - Body: CreateRoleDto (name, description)
  - Returns: Role object

- `GET /roles` - Get all roles
  - Required Permission: `role:read`
  - Returns: List of roles

- `GET /roles/system` - Get system roles only
  - Required Permission: `role:read`
  - Returns: List of system roles

- `GET /roles/custom` - Get custom roles only
  - Required Permission: `role:read`
  - Returns: List of custom roles

- `GET /roles/:id` - Get role by ID
  - Required Permission: `role:read`
  - Returns: Role object

- `PUT /roles/:id` - Update role
  - Required Permission: `role:update`
  - Body: UpdateRoleDto
  - Returns: Updated role

- `DELETE /roles/:id` - Delete role
  - Required Permission: `role:delete`
  - Returns: No content

- `POST /roles/:id/permissions` - Assign permissions to role
  - Required Permission: `role:update`
  - Body: { permissionIds: string[] }
  - Returns: Role with assigned permissions

- `POST /roles/:id/permissions/add` - Add permissions to role
  - Required Permission: `role:update`
  - Body: { permissionIds: string[] }
  - Returns: Role with added permissions

- `POST /roles/:id/permissions/remove` - Remove permissions from role
  - Required Permission: `role:update`
  - Body: { permissionIds: string[] }
  - Returns: Role with removed permissions

- `GET /roles/:id/stats` - Get role statistics
  - Required Permission: `role:read`
  - Returns: Role stats (users count, etc.)

- `POST /roles/:id/clone` - Clone a role
  - Required Permission: `role:create`
  - Body: { name: string }
  - Returns: New cloned role

- `POST /roles/initialize` - Initialize system roles
  - Required Permission: `role:create`
  - Returns: Array of initialized system roles

**Key Entities:** Role, Permission
**Key DTOs:** CreateRoleDto, UpdateRoleDto, AssignPermissionsDto
**System Roles:** Admin, User, Affiliate, Member

---

## USER MANAGEMENT

### Users Module
**Path:** `/users` (needs to be exposed via controller)
**Authentication:** JWT
**Attributes:**
- Roles: SUPER_ADMIN, ADMIN, USER, AFFILIATE, MEMBER
- Status: ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION
- Fields: email, firstName, lastName, phone, avatar, passwordHash
- Relations: Multiple roles/permissions, tenant

**Current State:** Entity exists but no dedicated controller found
**TODO:** Create user management endpoints (CRUD, role assignment, etc.)

---

## CRM MANAGEMENT

### Contacts Module (`/contacts`)
**Base Path:** `/contacts`
**Authentication:** JWT + Roles Guard
**Manages:** Contacts, Tags, Custom Fields, Contact Activities

#### Contact Endpoints:
- `POST /contacts` - Create new contact
  - Body: CreateContactDto (email, name, phone, company, etc.)
  - Returns: Contact object

- `GET /contacts` - Get all contacts with filters
  - Query: ContactQueryDto (page, limit, search, filters)
  - Returns: { data: Contact[], total, page, limit }

- `GET /contacts/stats` - Get contact statistics
  - Returns: Contact stats (total, by status, etc.)

- `POST /contacts/import` - Import contacts from CSV
  - Body: ImportContactsDto (csvData)
  - Returns: { imported: number, skipped: number, errors: string[] }

- `GET /contacts/:id` - Get contact by ID
  - Returns: Contact object with relationships

- `PUT /contacts/:id` - Update contact
  - Body: UpdateContactDto
  - Returns: Updated contact

- `DELETE /contacts/:id` - Delete contact
  - Returns: Success message

- `POST /contacts/:id/tags` - Add tags to contact
  - Body: { tagIds: string[] }
  - Returns: Contact with tags

- `DELETE /contacts/:id/tags` - Remove tags from contact
  - Body: { tagIds: string[] }
  - Returns: Contact without removed tags

- `POST /contacts/:id/subscribe` - Subscribe contact
  - Returns: Updated contact

- `POST /contacts/:id/unsubscribe` - Unsubscribe contact
  - Returns: Updated contact

- `PUT /contacts/:id/score` - Update lead score
  - Body: { score: number }
  - Returns: Contact with updated score

**Key Entities:** Contact, Tag, CustomField, ContactCustomFieldValue, ContactActivity
**Key DTOs:** CreateContactDto, UpdateContactDto, ContactQueryDto, ImportContactsDto, AddNoteDto, AddTagsDto, RemoveTagsDto

---

### Tags Module (`/tags`)
**Base Path:** `/tags`
**Authentication:** JWT + Roles Guard

#### Endpoints:
- `POST /tags` - Create new tag
  - Body: CreateTagDto (name, color, description)
  - Returns: Tag object

- `GET /tags` - Get all tags
  - Returns: Array of tags

- `GET /tags/:id` - Get tag by ID
  - Returns: Tag object

- `PUT /tags/:id` - Update tag
  - Body: UpdateTagDto
  - Returns: Updated tag

- `DELETE /tags/:id` - Delete tag
  - Returns: Success message

**Key Entities:** Tag
**Key DTOs:** CreateTagDto, UpdateTagDto

---

### Opportunities Module (`/opportunities`)
**Base Path:** `/opportunities`
**Authentication:** JWT + Roles Guard
**Manages:** Sales opportunities through pipeline stages

#### Endpoints:
- `POST /opportunities` - Create new opportunity
  - Body: CreateOpportunityDto (name, description, amount, contactId, pipelineId, stageId)
  - Returns: Opportunity object

- `GET /opportunities` - Get all opportunities
  - Query: OpportunityQueryDto (filters)
  - Returns: { data: Opportunity[], total, page, limit }

- `GET /opportunities/stats` - Get opportunity statistics
  - Returns: Stats (total value, by stage, etc.)

- `GET /opportunities/:id` - Get opportunity by ID
  - Returns: Opportunity object

- `PUT /opportunities/:id` - Update opportunity
  - Body: UpdateOpportunityDto
  - Returns: Updated opportunity

- `DELETE /opportunities/:id` - Delete opportunity
  - Returns: Success message

- `POST /opportunities/:id/move` - Move to different stage
  - Body: MoveOpportunityDto (stageId)
  - Returns: Updated opportunity

- `POST /opportunities/:id/win` - Mark as won
  - Body: WinOpportunityDto (amount, notes)
  - Returns: Updated opportunity

- `POST /opportunities/:id/lose` - Mark as lost
  - Body: LoseOpportunityDto (reason)
  - Returns: Updated opportunity

**Key Entities:** Opportunity
**Key DTOs:** CreateOpportunityDto, UpdateOpportunityDto, MoveOpportunityDto, WinOpportunityDto, LoseOpportunityDto, OpportunityQueryDto

---

### Pipelines Module (`/pipelines`)
**Base Path:** `/pipelines`
**Authentication:** JWT + Roles Guard
**Manages:** Sales pipelines and stages

#### Endpoints:
- `POST /pipelines` - Create new pipeline
  - Body: CreatePipelineDto (name, description, type)
  - Returns: Pipeline object

- `GET /pipelines` - Get all pipelines
  - Returns: Array of pipelines

- `GET /pipelines/default` - Get default pipeline
  - Returns: Default pipeline object

- `GET /pipelines/:id` - Get pipeline by ID
  - Returns: Pipeline with stages

- `GET /pipelines/:id/stats` - Get pipeline statistics
  - Returns: Stats (total opportunities, revenue, etc.)

- `PUT /pipelines/:id` - Update pipeline
  - Body: UpdatePipelineDto
  - Returns: Updated pipeline

- `DELETE /pipelines/:id` - Delete pipeline
  - Returns: Success message

- `POST /pipelines/:id/stages` - Add stage to pipeline
  - Body: AddPipelineStageDto (name, description, order)
  - Returns: New stage

- `PUT /pipelines/:id/stages/reorder` - Reorder stages
  - Body: ReorderStagesDto (stageIds[])
  - Returns: Updated pipeline

- `PUT /pipelines/stages/:stageId` - Update stage
  - Body: UpdatePipelineStageDto
  - Returns: Updated stage

- `DELETE /pipelines/stages/:stageId` - Delete stage
  - Returns: Success message

**Key Entities:** Pipeline, PipelineStage
**Key DTOs:** CreatePipelineDto, UpdatePipelineDto, AddPipelineStageDto, UpdatePipelineStageDto, ReorderStagesDto

---

## ORDER & PRODUCT MANAGEMENT

### Products Module (`/products`)
**Base Path:** `/products`
**Authentication:** JWT + Roles Guard
**Types:** PHYSICAL, DIGITAL, SERVICE, SUBSCRIPTION
**Status:** DRAFT, ACTIVE, INACTIVE, ARCHIVED

#### Endpoints:
- `POST /products` - Create product (Admin only)
  - Body: CreateProductDto (name, slug, description, price, type, inventory)
  - Returns: Product object

- `GET /products` - Get all products
  - Query: ProductQueryDto (page, limit, filters, search)
  - Returns: { data: Product[], total, page, limit }

- `GET /products/stats` - Get product statistics (Admin only)
  - Returns: Product stats

- `GET /products/slug/:slug` - Get product by slug
  - Returns: Product object

- `GET /products/:id` - Get product by ID
  - Returns: Product object

- `PUT /products/:id` - Update product (Admin only)
  - Body: UpdateProductDto
  - Returns: Updated product

- `DELETE /products/:id` - Delete product (Admin only)
  - Returns: Success message

- `PUT /products/:id/inventory` - Update inventory (Admin only)
  - Body: { quantity: number }
  - Returns: Updated product

**Key Entities:** Product, OrderItem
**Key DTOs:** CreateProductDto, UpdateProductDto, ProductQueryDto
**Product Types:** Physical, Digital, Service, Subscription

---

### Cart Module (`/cart`)
**Base Path:** `/cart`
**Authentication:** JWT + Roles Guard
**Manages:** Shopping carts and cart items

#### Endpoints:
- `GET /cart` - Get current cart
  - Returns: Cart object with items

- `POST /cart/items` - Add item to cart
  - Body: AddToCartDto (productId, quantity, customization)
  - Returns: Updated cart

- `PUT /cart/items/:itemId` - Update cart item
  - Body: UpdateCartItemDto (quantity)
  - Returns: Updated cart

- `DELETE /cart/items/:itemId` - Remove item from cart
  - Returns: Updated cart

- `DELETE /cart` - Clear cart
  - Returns: Empty cart

**Key Entities:** Cart, CartItem
**Key DTOs:** AddToCartDto, UpdateCartItemDto

---

### Orders Module (`/orders`)
**Base Path:** `/orders`
**Authentication:** JWT + Roles Guard
**Status:** PENDING, PROCESSING, COMPLETED, CANCELLED, REFUNDED

#### Endpoints:
- `POST /orders` - Create new order
  - Body: CreateOrderDto (items, shippingAddress, billingAddress, customerId)
  - Returns: Order object

- `GET /orders` - Get all orders
  - Query: OrderQueryDto (page, limit, status, date range)
  - Returns: { data: Order[], total, page, limit }

- `GET /orders/stats` - Get order statistics (Admin only)
  - Query: ?startDate=ISO, ?endDate=ISO
  - Returns: Order stats (total revenue, average, etc.)

- `GET /orders/number/:orderNumber` - Get order by number
  - Returns: Order object

- `GET /orders/:id` - Get order by ID
  - Returns: Order object with items

- `PUT /orders/:id` - Update order (Admin only)
  - Body: UpdateOrderDto
  - Returns: Updated order

- `POST /orders/:id/cancel` - Cancel order
  - Body: { reason?: string }
  - Returns: Cancelled order

- `POST /orders/:id/refund` - Refund order (Admin only)
  - Body: RefundOrderDto (amount, reason)
  - Returns: Refunded order

**Key Entities:** Order, OrderItem, Product
**Key DTOs:** CreateOrderDto, UpdateOrderDto, OrderQueryDto, RefundOrderDto

---

## EMAIL MARKETING

### Email Campaigns Module (`/email-campaigns`)
**Base Path:** `/email-campaigns`
**Authentication:** JWT + Roles Guard
**Campaign Types:** BROADCAST, AB_TEST, RSS
**Status:** DRAFT, SCHEDULED, SENDING, SENT, PAUSED, CANCELLED, ARCHIVED

#### Endpoints:
- `POST /email-campaigns` - Create campaign
  - Body: CreateEmailCampaignDto (name, type, templateId, segmentId, subject, content)
  - Returns: Campaign object

- `GET /email-campaigns` - Get all campaigns
  - Query: EmailCampaignQueryDto (page, limit, status, type)
  - Returns: List of campaigns

- `GET /email-campaigns/:id` - Get campaign by ID
  - Returns: Campaign object

- `GET /email-campaigns/:id/statistics` - Get campaign stats
  - Returns: Stats (sent, opened, clicked, bounced, etc.)

- `PUT /email-campaigns/:id` - Update campaign
  - Body: UpdateEmailCampaignDto
  - Returns: Updated campaign

- `POST /email-campaigns/:id/schedule` - Schedule/send campaign
  - Body: SendCampaignDto (scheduleTime, segmentId)
  - Returns: Scheduled campaign

- `DELETE /email-campaigns/:id` - Delete campaign (Admin only)
  - Returns: Success message

**Key Entities:** EmailCampaign, EmailLog
**Key DTOs:** CreateEmailCampaignDto, UpdateEmailCampaignDto, EmailCampaignQueryDto, SendCampaignDto
**Related:** Segments, Email Templates, Email Logs

---

### Email Templates Module (`/email-templates`)
**Base Path:** `/email-templates` (primary module location)
**Also:** `/email-templates` (secondary module location for email module)
**Authentication:** JWT + Permission/Roles Guard
**Status:** DRAFT, ACTIVE, ARCHIVED
**Categories:** WELCOME, TRANSACTIONAL, PROMOTIONAL, NOTIFICATION, etc.

#### Endpoints (Primary):
- `POST /email-templates` - Create template
  - Required Permission: `email_templates:create`
  - Body: CreateEmailTemplateDto (name, category, subject, content, variables)
  - Returns: Template object

- `GET /email-templates` - Get all templates
  - Required Permission: `email_templates:read`
  - Query: ?category=string, ?status=string
  - Returns: List of templates

- `GET /email-templates/search` - Search templates
  - Required Permission: `email_templates:read`
  - Query: ?q=string
  - Returns: Search results

- `GET /email-templates/:id` - Get template by ID
  - Required Permission: `email_templates:read`
  - Returns: Template object

- `PUT /email-templates/:id` - Update template
  - Required Permission: `email_templates:update`
  - Body: UpdateEmailTemplateDto
  - Returns: Updated template

- `DELETE /email-templates/:id` - Delete template
  - Required Permission: `email_templates:delete`
  - Returns: Success message

- `POST /email-templates/:id/clone` - Clone template
  - Required Permission: `email_templates:create`
  - Body: { name?: string }
  - Returns: New cloned template

- `POST /email-templates/:id/activate` - Activate template
  - Required Permission: `email_templates:update`
  - Returns: Activated template

- `POST /email-templates/:id/archive` - Archive template
  - Required Permission: `email_templates:update`
  - Returns: Archived template

- `POST /email-templates/:id/render` - Render template with data
  - Required Permission: `email_templates:read`
  - Body: RenderTemplateDto (variables, data)
  - Returns: Rendered HTML

- `GET /email-templates/:id/preview` - Preview template
  - Required Permission: `email_templates:read`
  - Query: ?sampleData=JSON
  - Returns: Preview HTML

- `GET /email-templates/:id/statistics` - Get template stats
  - Required Permission: `email_templates:read`
  - Returns: Usage stats

- `GET /email-templates/category/:category/active` - Get active by category
  - Required Permission: `email_templates:read`
  - Returns: List of active templates

**Key Entities:** EmailTemplate
**Key DTOs:** CreateEmailTemplateDto, UpdateEmailTemplateDto, RenderTemplateDto

---

### Email Sequences Module (`/email-sequences`)
**Base Path:** `/email-sequences` (in email-automation module)
**Aliases:** Email Sequences (duplicate in email module too)
**Authentication:** JWT
**Status:** DRAFT, ACTIVE, PAUSED

#### Endpoints:
- `POST /email-sequences` - Create email sequence
  - Body: CreateEmailSequenceDto (name, steps, triggerType)
  - Returns: Sequence object

- `GET /email-sequences` - Get all sequences
  - Query: ?status=string
  - Returns: List of sequences

- `GET /email-sequences/:id` - Get sequence by ID
  - Returns: Sequence with steps

- `PUT /email-sequences/:id` - Update sequence
  - Body: UpdateEmailSequenceDto
  - Returns: Updated sequence

- `POST /email-sequences/:id/activate` - Activate sequence
  - Returns: Activated sequence

- `POST /email-sequences/:id/pause` - Pause sequence
  - Returns: Paused sequence

- `POST /email-sequences/:id/enroll` - Enroll subscriber
  - Body: { subscriberId: string }
  - Returns: EnrollmentConfirmation

- `POST /email-sequences/:id/unsubscribe/:subscriberId` - Unsubscribe from sequence
  - Returns: Updated subscriber

- `GET /email-sequences/:id/statistics` - Get sequence stats
  - Returns: Sequence statistics

- `POST /email-sequences/process-pending` - Process pending emails
  - Returns: Process result

**Key Entities:** EmailSequence, EmailSequenceStep, EmailSequenceSubscriber
**Key DTOs:** CreateEmailSequenceDto, UpdateEmailSequenceDto

---

### Email Segments Module (`/segments`)
**Base Path:** `/segments` (in email module)
**Manages:** Contact segments for email targeting

#### Endpoints:
- `POST /segments` - Create segment
  - Body: CreateSegmentDto (name, description, conditions)
  - Returns: Segment object

- `GET /segments` - Get all segments
  - Returns: List of segments

- `GET /segments/:id` - Get segment by ID
  - Returns: Segment with condition details

- `PUT /segments/:id` - Update segment
  - Body: UpdateSegmentDto
  - Returns: Updated segment

- `DELETE /segments/:id` - Delete segment
  - Returns: Success message

- `GET /segments/:id/count` - Get segment contact count
  - Returns: { count: number }

**Key Entities:** Segment
**Key DTOs:** CreateSegmentDto, UpdateSegmentDto

---

## FUNNEL & PAGE MANAGEMENT

### Funnels Module (`/funnels`)
**Base Path:** `/funnels`
**Authentication:** JWT
**Types:** LEAD_GENERATION, SALES, WEBINAR, PRODUCT_LAUNCH, MEMBERSHIP, TRIPWIRE, VSL, APPLICATION, SURVEY, CUSTOM
**Status:** DRAFT, ACTIVE, PAUSED, ARCHIVED

#### Endpoints:
- `POST /funnels` - Create funnel
  - Body: CreateFunnelDto (name, type, description)
  - Returns: Funnel object

- `GET /funnels` - Get all funnels
  - Query: ?status=FunnelStatus
  - Returns: List of funnels

- `GET /funnels/:id` - Get funnel by ID
  - Returns: Funnel with pages

- `GET /funnels/slug/:slug` - Get funnel by slug
  - Returns: Funnel object

- `PUT /funnels/:id` - Update funnel
  - Body: UpdateFunnelDto
  - Returns: Updated funnel

- `POST /funnels/:id/publish` - Publish funnel
  - Returns: Published funnel

- `POST /funnels/:id/unpublish` - Unpublish funnel
  - Returns: Unpublished funnel

- `POST /funnels/:id/clone` - Clone funnel
  - Body: CloneFunnelDto (name)
  - Returns: New funnel

- `GET /funnels/:id/stats` - Get funnel statistics
  - Returns: Stats (visitors, conversions, revenue, etc.)

- `DELETE /funnels/:id` - Delete funnel
  - Returns: No content

**Key Entities:** Funnel, Page, FunnelVariant, FunnelAnalytics
**Key DTOs:** CreateFunnelDto, UpdateFunnelDto, CloneFunnelDto

---

### Pages Module (`/pages`)
**Base Path:** `/pages`
**Authentication:** JWT
**Manages:** Individual pages within funnels with builder elements

#### Endpoints:
- `POST /pages` - Create new page
  - Body: CreatePageDto (name, slug, funnelId, layout, elements)
  - Returns: Page object

- `GET /pages/funnel/:funnelId` - Get all pages in funnel
  - Returns: Array of pages

- `GET /pages/:id` - Get page by ID
  - Returns: Page with all elements

- `GET /pages/funnel/:funnelId/slug/:slug` - Get page by slug
  - Returns: Page object

- `PUT /pages/:id` - Update page
  - Body: UpdatePageDto
  - Returns: Updated page

- `POST /pages/funnel/:funnelId/reorder` - Reorder pages
  - Body: ReorderPagesDto (pageIds[])
  - Returns: Updated funnel

- `POST /pages/variant` - Create A/B test variant
  - Body: CreatePageVariantDto (pageId, name)
  - Returns: New variant

- `GET /pages/:id/variants` - Get page variants
  - Returns: Array of variants

- `DELETE /pages/:id` - Delete page
  - Returns: No content

**Key Entities:** Page, PageElement, PageBlock, PageForm, PagePopup, FunnelVariant
**Key DTOs:** CreatePageDto, UpdatePageDto, CreatePageVariantDto, ReorderPagesDto

---

### Page Elements & Builder Components
**Entities:**
- PageElement: Individual elements on a page
- PageBlock: Container blocks (header, hero, features, etc.)
- PageForm: Forms embedded in pages
- PagePopup: Popup elements
- PageTheme: Theme styling for pages
- MediaAsset: Images, videos, and other media

**Related DTOs:** PageElementDto, PageBlockDto, PageFormDto, PagePopupDto, PageThemeDto, MediaAssetDto

---

## AFFILIATE MARKETING

### Affiliates Module (`/affiliates`)
**Base Path:** `/affiliates`
**Authentication:** JWT + Roles Guard
**Status:** PENDING, APPROVED, REJECTED, SUSPENDED, ACTIVE

#### Endpoints:
- `POST /affiliates/register` - Register as affiliate
  - Body: RegisterAffiliateDto (bankDetails, paymentMethod, taxInfo)
  - Returns: Affiliate object

- `GET /affiliates` - Get all affiliates (Admin only)
  - Query: ?status=string
  - Returns: List of affiliates

- `GET /affiliates/me` - Get current user's affiliate account
  - Returns: Affiliate object

- `GET /affiliates/me/stats` - Get personal affiliate stats
  - Query: AffiliateStatsQueryDto (dateRange)
  - Returns: Affiliate statistics

- `POST /affiliates/me/generate-link` - Generate affiliate link
  - Body: GenerateAffiliateLinkDto (productId/funnelId)
  - Returns: { link: string }

- `GET /affiliates/:id` - Get affiliate by ID
  - Returns: Affiliate object

- `GET /affiliates/code/:code` - Get affiliate by code
  - Returns: Affiliate object

- `PUT /affiliates/:id` - Update affiliate (Admin only)
  - Body: UpdateAffiliateDto
  - Returns: Updated affiliate

- `POST /affiliates/:id/approve` - Approve affiliate (Admin only)
  - Returns: Approved affiliate

- `POST /affiliates/:id/reject` - Reject affiliate (Admin only)
  - Body: { reason: string }
  - Returns: Rejected affiliate

- `POST /affiliates/:id/suspend` - Suspend affiliate (Admin only)
  - Body: { reason: string }
  - Returns: Suspended affiliate

- `POST /affiliates/:id/reactivate` - Reactivate affiliate (Admin only)
  - Returns: Reactivated affiliate

- `GET /affiliates/:id/stats` - Get affiliate statistics
  - Query: AffiliateStatsQueryDto (dateRange)
  - Returns: Affiliate statistics

- `DELETE /affiliates/:id` - Delete affiliate (Admin only)
  - Returns: Success message

- `POST /affiliates/track-click` - Track affiliate click
  - Body: TrackClickDto (affiliateCode, productId, utm_params)
  - Returns: { clickId, visitorId, cookieExpiry }

**Key Entities:** Affiliate, AffiliateClick, Commission, Payout
**Key DTOs:** RegisterAffiliateDto, UpdateAffiliateDto, GenerateAffiliateLinkDto, TrackClickDto, AffiliateStatsQueryDto

---

### Commissions Module (`/commissions`)
**Base Path:** `/commissions`
**Authentication:** JWT + Roles Guard
**Status:** PENDING, APPROVED, REJECTED, PAID

#### Endpoints:
- `POST /commissions` - Create commission (Admin only)
  - Body: CreateCommissionDto (affiliateId, orderId, amount, rate)
  - Returns: Commission object

- `GET /commissions` - Get all commissions
  - Query: CommissionQueryDto (page, limit, status)
  - Returns: { data: Commission[], total, page, limit }

- `GET /commissions/my` - Get current user's commissions
  - Query: CommissionQueryDto
  - Returns: List of commissions

- `GET /commissions/:id` - Get commission by ID
  - Returns: Commission object

- `PUT /commissions/:id` - Update commission (Admin only)
  - Body: UpdateCommissionDto
  - Returns: Updated commission

- `POST /commissions/approve` - Approve commission (Admin only)
  - Body: ApproveCommissionDto (commissionId, notes)
  - Returns: Approved commission

- `POST /commissions/reject` - Reject commission (Admin only)
  - Body: RejectCommissionDto (commissionId, reason)
  - Returns: Rejected commission

- `GET /commissions/affiliate/:affiliateId/pending` - Get pending commissions
  - Returns: List of pending commissions

- `GET /commissions/affiliate/:affiliateId/payable` - Get payable commissions
  - Returns: List of payable commissions

- `GET /commissions/affiliate/:affiliateId/stats` - Get commission stats
  - Query: ?startDate=ISO, ?endDate=ISO
  - Returns: Commission statistics

**Key Entities:** Commission, CommissionPlan
**Key DTOs:** CreateCommissionDto, UpdateCommissionDto, ApproveCommissionDto, RejectCommissionDto, CommissionQueryDto

---

### Payouts Module (`/payouts`)
**Base Path:** `/payouts`
**Authentication:** JWT + Roles Guard
**Status:** PENDING, PROCESSING, COMPLETED, FAILED

#### Endpoints:
**Currently endpoints not detailed in controller review**
**Key Entities:** Payout, Commission
**Related Features:** Payout schedules, bank account management, payment processing

---

## ANALYTICS & TRACKING

### Analytics Module (`/analytics`)
**Base Path:** `/analytics`
**Authentication:** JWT + Tenant scoped
**Tracks:** Events, revenue, funnels, UTM performance, devices, geo, cohorts, trends

#### Endpoints:
- `POST /analytics/track` - Track event
  - Body: TrackEventDto (eventType, eventName, properties, userId)
  - Returns: Tracked event confirmation

- `GET /analytics/revenue` - Get revenue analytics
  - Query: ?startDate=ISO, ?endDate=ISO, ?groupBy=string
  - Returns: Revenue data

- `GET /analytics/revenue/by-product` - Revenue by product
  - Returns: Product revenue breakdown

- `GET /analytics/revenue/by-affiliate` - Revenue by affiliate
  - Returns: Affiliate revenue breakdown

- `GET /analytics/funnel/:funnelId` - Funnel analytics
  - Returns: Funnel conversion metrics

- `GET /analytics/utm-performance` - UTM parameter performance
  - Returns: UTM tracking data

- `GET /analytics/devices` - Device analytics
  - Returns: Device breakdowns

- `GET /analytics/geo` - Geographic analytics
  - Returns: Geo location data

- `GET /analytics/cohorts` - Cohort analysis
  - Returns: Cohort data

- `GET /analytics/realtime` - Real-time metrics
  - Returns: Current real-time data

- `GET /analytics/trends` - Trend analysis
  - Query: ?metric=string, ?timeframe=string
  - Returns: Trend data

- `GET /analytics/funnel/:funnelId/stats` - Detailed funnel stats
  - Returns: Detailed funnel statistics

- `GET /analytics/page/:pageId` - Page analytics
  - Returns: Page-specific metrics

**Key Entities:** AnalyticsEvent
**Key DTOs:** TrackEventDto

---

### Webhooks Module (`/webhooks`)
**Base Path:** `/webhooks`
**Authentication:** JWT
**Available Events:** order.created, order.updated, order.completed, contact.created, affiliate.registered, commission.approved, payment.completed, etc.

#### Endpoints:
- `POST /webhooks` - Create webhook
  - Body: CreateWebhookDto (url, events, secret, isActive)
  - Returns: Webhook object

- `GET /webhooks` - Get all webhooks
  - Returns: List of webhooks

- `GET /webhooks/:id` - Get webhook by ID
  - Returns: Webhook object

- `PUT /webhooks/:id` - Update webhook
  - Body: UpdateWebhookDto
  - Returns: Updated webhook

- `DELETE /webhooks/:id` - Delete webhook
  - Returns: No content

- `POST /webhooks/:id/test` - Send test webhook
  - Returns: Test result

- `GET /webhooks/:id/stats` - Get webhook statistics
  - Returns: Success/failure rates, last triggered, etc.

- `GET /webhooks/:id/attempts` - Get delivery attempts
  - Query: ?limit=50
  - Returns: Array of attempts

- `POST /webhooks/:id/enable` - Enable webhook
  - Returns: Enabled webhook

- `POST /webhooks/:id/disable` - Disable webhook
  - Returns: Disabled webhook

- `GET /webhooks/meta/events` - Get available events
  - Returns: Array of event types

- `POST /webhooks/verify-signature` - Verify webhook signature
  - Body: { payload, signature, secret }
  - Returns: { valid: boolean }

**Key Entities:** Webhook, WebhookAttempt
**Key DTOs:** CreateWebhookDto, UpdateWebhookDto

---

## ADMIN & AUDIT

### Admin Dashboard (`/admin`)
**Base Path:** `/admin`
**Authentication:** JWT + Permission Guard
**Required Permission:** `settings:read`

#### Endpoints:
- `GET /admin/dashboard/stats` - Dashboard statistics
  - Returns: Dashboard metrics (users, revenue, orders, etc.)

- `GET /admin/system/health` - System health check
  - Returns: System health status

- `GET /admin/tenants` - Get all tenants with analytics
  - Query: ?limit=50, ?offset=0
  - Returns: List of tenants with analytics

- `GET /admin/tenants/:tenantId/analytics` - Tenant analytics
  - Returns: Detailed tenant analytics

- `GET /admin/analytics/revenue` - Global revenue analytics
  - Query: ?startDate=ISO, ?endDate=ISO
  - Returns: Revenue analytics

- `GET /admin/analytics/users/growth` - User growth analytics
  - Query: ?days=30
  - Returns: Growth metrics

**Required Permission:** `settings:read`

---

### Audit Logs Module (`/audit`)
**Base Path:** `/audit`
**Authentication:** JWT + Permission Guard
**Required Permission:** `settings:read`
**Logs:** All CRUD operations, permission changes, sensitive actions

#### Endpoints:
- `GET /audit` - Get audit logs with filters
  - Query: ?userId, ?action, ?resource, ?severity, ?startDate, ?endDate, ?limit, ?offset
  - Returns: List of audit logs

- `GET /audit/recent` - Get recent audit logs
  - Query: ?limit=100
  - Returns: Recent logs

- `GET /audit/resource/:resource` - Get logs for resource
  - Query: ?resourceId, ?limit
  - Returns: Resource audit logs

- `GET /audit/user/:userId` - Get logs for user
  - Query: ?limit
  - Returns: User activity logs

- `GET /audit/stats` - Get audit statistics
  - Query: ?startDate, ?endDate
  - Returns: Audit statistics

- `GET /audit/sensitive` - Get sensitive actions
  - Query: ?limit=50
  - Returns: Sensitive action logs

- `GET /audit/export` - Export audit logs
  - Query: ?startDate, ?endDate
  - Returns: CSV/JSON export

- `DELETE /audit/cleanup` - Cleanup old logs
  - Query: ?days=90
  - Returns: Deletion confirmation

**Key Entities:** AuditLog
**Key DTOs:** AuditLogFilter
**Audit Actions:** CREATE, READ, UPDATE, DELETE, EXPORT, IMPORT, AUTHORIZE, etc.
**Audit Severity:** LOW, MEDIUM, HIGH, CRITICAL

---

## PAYMENT & SUBSCRIPTIONS

### Payments Module (`/payments`)
**Base Path:** `/payments`
**Authentication:** JWT (mostly) + Public for webhooks
**Gateway:** Stripe integration

#### Endpoints:
- `POST /payments/intents` - Create payment intent
  - Auth: JWT + `order:create` permission
  - Body: CreatePaymentIntentDto (amount, currency, customerId, orderId)
  - Returns: { payment, clientSecret }

- `POST /payments/intents/:paymentIntentId/confirm` - Confirm payment
  - Auth: JWT + `order:read` permission
  - Returns: Confirmed payment

- `POST /payments/:paymentId/refund` - Refund payment
  - Auth: JWT + `order:refund` permission
  - Body: { amount?, reason? }
  - Returns: Refunded payment

- `POST /payments/subscriptions` - Create subscription
  - Auth: JWT + `order:create` permission
  - Body: CreateSubscriptionDto (priceId, customerId)
  - Returns: Subscription object

- `POST /payments/subscriptions/:subscriptionId/cancel` - Cancel subscription
  - Auth: JWT + `order:update` permission
  - Body: { cancelAtPeriodEnd?: boolean }
  - Returns: Cancelled subscription

- `POST /payments/webhook` - Stripe webhook (Public)
  - Headers: stripe-signature
  - Body: Raw Stripe event
  - Returns: { received: true }

**Key Entities:** Payment, PaymentMethod, Subscription
**Key DTOs:** CreatePaymentIntentDto, CreateSubscriptionDto
**Stripe Events:** payment_intent.succeeded, customer.subscription.created, etc.

---

## FILE MANAGEMENT

### File Upload Module (`/files`)
**Base Path:** `/files`
**Authentication:** JWT + Permission Guard
**Max File Size:** 100MB
**Supports:** Direct upload, presigned URLs for client-side upload

#### Endpoints:
- `POST /files/upload` - Upload file directly
  - Required Permission: `funnel:create`
  - Content-Type: multipart/form-data
  - Body: file, resourceType?, resourceId?, isPublic?, expiresIn?
  - Returns: File object with URL

- `POST /files/presigned-url` - Generate presigned URL
  - Required Permission: `funnel:create`
  - Body: GeneratePresignedUrlDto (filename, size, contentType)
  - Returns: { uploadUrl, fileId }

- `POST /files/:fileId/confirm` - Confirm presigned upload
  - Required Permission: `funnel:create`
  - Returns: Confirmed file object

- `GET /files/:fileId` - Get file details
  - Required Permission: `funnel:read`
  - Returns: File object

- `GET /files/:fileId/download` - Get download URL
  - Required Permission: `funnel:read`
  - Query: ?expiresIn=3600
  - Returns: { url: string }

- `GET /files` - Get all files
  - Required Permission: `funnel:read`
  - Query: ?limit=50
  - Returns: List of files

- `GET /files/resource/:resourceType/:resourceId` - Get files by resource
  - Required Permission: `funnel:read`
  - Returns: Files for that resource

- `DELETE /files/:fileId` - Delete file
  - Required Permission: `funnel:delete`
  - Returns: No content

**Key Entities:** File
**Key DTOs:** GeneratePresignedUrlDto
**Storage:** S3 or similar cloud storage

---

## SECURITY & AUTHENTICATION

### Two-Factor Authentication (`/2fa`)
**Base Path:** `/2fa`
**Authentication:** JWT
**Methods:** TOTP (Time-based One-Time Password)

#### Endpoints:
- `POST /2fa/setup` - Setup 2FA
  - Body: Setup2FADto
  - Returns: { secret, qrCode, backupCodes }

- `POST /2fa/enable` - Enable 2FA
  - Body: Enable2FADto (token, method)
  - Returns: Success message

- `DELETE /2fa/disable` - Disable 2FA
  - Body: { token: string }
  - Returns: Success message

- `POST /2fa/verify` - Verify 2FA token
  - Body: { token: string }
  - Returns: { valid: boolean }

- `GET /2fa/status` - Get 2FA status
  - Returns: 2FA status

- `POST /2fa/backup-codes/regenerate` - Regenerate backup codes
  - Body: { token: string }
  - Returns: { backupCodes: string[] }

**Key Entities:** TwoFactorAuth
**Key DTOs:** Setup2FADto, Enable2FADto

---

### API Keys Module (`/api-keys`)
**Base Path:** `/api-keys`
**Authentication:** JWT
**Scopes:** Can be restricted to specific resources/actions

#### Endpoints:
- `POST /api-keys` - Create API key
  - Body: CreateApiKeyDto (name, scopes, expiresAt)
  - Returns: { apiKey, secret }

- `GET /api-keys` - Get all API keys
  - Returns: List of API keys (without secrets)

- `GET /api-keys/:id` - Get API key
  - Returns: API key details

- `PUT /api-keys/:id` - Update API key
  - Body: UpdateApiKeyDto
  - Returns: Updated API key

- `POST /api-keys/:id/revoke` - Revoke API key
  - Returns: Revoked key

- `DELETE /api-keys/:id` - Delete API key
  - Returns: No content

- `GET /api-keys/:id/stats` - Get API key usage stats
  - Returns: Usage statistics

**Key Entities:** ApiKey
**Key DTOs:** CreateApiKeyDto, UpdateApiKeyDto

---

## NOTIFICATIONS

### Notifications Module (`/notifications`)
**Base Path:** `/notifications`
**Authentication:** JWT
**Types:** EMAIL, IN_APP, SMS, PUSH

#### Endpoints:
- `GET /notifications` - Get user notifications
  - Query: ?limit, ?offset, ?status
  - Returns: List of notifications

- `GET /notifications/unread` - Get unread notifications
  - Returns: Unread notifications only

- `GET /notifications/unread/count` - Get unread count
  - Returns: { count: number }

- `GET /notifications/stats` - Get notification stats
  - Returns: Stats by type/status

- `POST /notifications/:notificationId/read` - Mark as read
  - Returns: Updated notification

- `POST /notifications/read-all` - Mark all as read
  - Returns: Success message

- `DELETE /notifications/:notificationId` - Delete notification
  - Returns: No content

- `DELETE /notifications` - Delete all notifications
  - Returns: Success message

- `GET /notifications/connection/status` - WebSocket connection status
  - Returns: Connection status

**Key Entities:** Notification
**Real-time:** WebSocket for live notifications

---

## CUSTOM DOMAINS

### Custom Domains Module (`/custom-domains`)
**Base Path:** `/custom-domains`
**Authentication:** JWT
**Status:** PENDING, VERIFIED, ACTIVE, SUSPENDED

#### Endpoints:
- `POST /custom-domains` - Add custom domain
  - Body: CreateCustomDomainDto (domain, resourceType, resourceId)
  - Returns: Domain object with verification steps

- `GET /custom-domains` - Get all domains
  - Returns: List of custom domains

- `GET /custom-domains/:id` - Get domain by ID
  - Returns: Domain object

- `GET /custom-domains/resource/:type/:resourceId` - Get domains for resource
  - Returns: Associated domains

- `POST /custom-domains/:id/verify` - Verify domain
  - Returns: Verification result

- `POST /custom-domains/:id/activate` - Activate domain
  - Returns: Activated domain

- `POST /custom-domains/:id/suspend` - Suspend domain
  - Returns: Suspended domain

- `PUT /custom-domains/:id` - Update domain settings
  - Body: UpdateCustomDomainDto
  - Returns: Updated domain

- `DELETE /custom-domains/:id` - Delete domain
  - Returns: No content

- `POST /custom-domains/:id/ssl/enable` - Enable SSL
  - Returns: SSL status

- `POST /custom-domains/:id/ssl/renew` - Renew SSL certificate
  - Returns: Renewal status

- `GET /custom-domains/:id/stats` - Get domain statistics
  - Returns: Domain traffic/usage stats

**Key Entities:** CustomDomain
**Key DTOs:** CreateCustomDomainDto, UpdateCustomDomainDto

---

## A/B TESTING

### A/B Testing Module (`/ab-tests`)
**Base Path:** `/ab-tests`
**Authentication:** JWT
**Status:** DRAFT, ACTIVE, PAUSED, COMPLETED

#### Endpoints:
- `POST /ab-tests` - Create A/B test
  - Body: CreateAbTestDto (name, controlVariantId, testVariantId, metric)
  - Returns: Test object

- `GET /ab-tests` - Get all tests
  - Returns: List of tests

- `GET /ab-tests/:id` - Get test by ID
  - Returns: Test object with results

- `POST /ab-tests/:id/start` - Start test
  - Returns: Started test

- `POST /ab-tests/:id/pause` - Pause test
  - Returns: Paused test

- `POST /ab-tests/:id/complete` - Complete test
  - Returns: Completed test with winner

- `POST /ab-tests/:id/assign` - Assign visitor to variant
  - Body: { visitorId: string }
  - Returns: Assigned variant

- `POST /ab-tests/:id/convert` - Record conversion
  - Body: { visitorId: string, conversionValue: number }
  - Returns: Updated test

- `POST /ab-tests/:id/event` - Record custom event
  - Body: { visitorId, eventName, eventData }
  - Returns: Updated event

**Key Entities:** ABTest, ABTestParticipant
**Key DTOs:** CreateAbTestDto, UpdateAbTestDto

---

## CROSS-CUTTING CONCERNS

### Authentication & Authorization
**Global Guards Applied:**
- JWT Auth Guard (protects all endpoints except @Public marked)
- Roles Guard (checks user roles)
- Permissions Guard (checks RBAC permissions)

**Decorators Available:**
- @CurrentUser() - Inject current user
- @GetTenant() - Inject tenant ID
- @GetUser() - Inject user ID
- @Roles(...) - Require specific roles
- @RequirePermissions(...) - Require specific permissions
- @Public() - Mark endpoint as public

**Rate Limiting:**
- Global: 100 requests per 60 seconds

### Caching
**Module:** CacheModule
**Decorator:** @Cacheable(...) 
**Features:** Distributed caching, automatic invalidation

### Message Queue
**Module:** QueueModule
**Uses:** Background job processing
**Processors:**
- Email processor (send emails)
- Webhook processor (deliver webhooks)
- Data processing processor

---

## ENTITY RELATIONSHIPS MAP

```
User
  ├─ Tenant (many to one)
  ├─ Roles (many to many)
  ├─ Permissions (many to many through roles)
  ├─ Contacts (as creator)
  ├─ Funnels (as creator)
  └─ Orders (as customer/creator)

Tenant
  ├─ Users (one to many)
  ├─ Funnels (one to many)
  ├─ Contacts (one to many)
  ├─ Opportunities (one to many)
  ├─ Orders (one to many)
  ├─ Products (one to many)
  ├─ Affiliates (one to many)
  ├─ EmailCampaigns (one to many)
  └─ Webhooks (one to many)

Funnel
  ├─ Pages (one to many)
  ├─ FunnelVariants (one to many)
  ├─ FunnelAnalytics (one to many)
  └─ CustomDomain (many to one)

Page
  ├─ PageElements (one to many)
  ├─ PageBlocks (one to many)
  ├─ PageForms (one to many)
  └─ PageThemes (many to one)

Contact
  ├─ Tags (many to many)
  ├─ CustomFieldValues (one to many)
  ├─ Opportunities (one to many)
  ├─ Activities (one to many)
  └─ SubscribedSegments (many to many)

Order
  ├─ OrderItems (one to many)
  ├─ Products (many to many through OrderItems)
  ├─ Customer (Contact)
  ├─ Payments (one to many)
  └─ Affiliate (commission tracking)

EmailCampaign
  ├─ EmailTemplate (many to one)
  ├─ Segment (many to one)
  ├─ EmailLogs (one to many)
  └─ A/B Test variants (optional)

Affiliate
  ├─ User (one to one)
  ├─ Commissions (one to many)
  ├─ Payouts (one to many)
  └─ AffiliateClicks (one to many)

Role
  └─ Permissions (many to many)

ABTest
  ├─ Control variant
  ├─ Test variant
  └─ Participants (many to many)
```

---

## KEY FEATURES TO BUILD IN FRONTEND

1. **Authentication**
   - Login/Register pages
   - JWT token management
   - 2FA setup/verification
   - Password reset flow

2. **Dashboard**
   - Admin dashboard with overall stats
   - User dashboard with personal metrics
   - Real-time notifications

3. **CRM System**
   - Contact management with CRUD
   - Tag management
   - Contact scoring
   - Pipeline/opportunity tracking
   - Activity timeline

4. **Funnel Builder**
   - Visual funnel creator
   - Drag-and-drop page builder
   - Page variants for A/B testing
   - Theme customization
   - Form building

5. **Product & Order Management**
   - Product catalog
   - Shopping cart
   - Checkout process
   - Order tracking
   - Refund management

6. **Email Marketing**
   - Email campaign builder
   - Template management
   - Segment/list management
   - Email sequences
   - Campaign analytics

7. **Affiliate Program**
   - Affiliate dashboard
   - Link generation
   - Commission tracking
   - Payout requests
   - Performance analytics

8. **Analytics Dashboard**
   - Funnel conversion tracking
   - Revenue analytics
   - UTM tracking
   - Geographic/device breakdown
   - Real-time metrics

9. **Admin Controls**
   - User/role management
   - Permission configuration
   - System health monitoring
   - Audit logs
   - Tenant management

10. **File Management**
    - File upload interface
    - Media library
    - File linking to resources

11. **Settings**
    - Custom domains
    - API keys
    - 2FA configuration
    - Webhook management
    - Integration settings

---

## IMPORTANT NOTES FOR FRONTEND DEVELOPMENT

1. **Tenant Scoping**: All requests must include tenant context via @GetTenant decorator
2. **Permission System**: Check permissions before enabling UI features
3. **Role-Based Views**: Different views for Admin, User, Affiliate roles
4. **Real-time Updates**: Use WebSockets for notifications and live metrics
5. **Error Handling**: Proper error messages from backend with specific codes
6. **Pagination**: Most list endpoints support limit/offset pagination
7. **Filtering**: Use query parameters for filtering (status, date range, search, etc.)
8. **CORS**: Ensure frontend domain is in CORS whitelist
9. **Rate Limiting**: Implement request debouncing/throttling on frontend
10. **File Uploads**: Use presigned URLs for large files to avoid server bottleneck

