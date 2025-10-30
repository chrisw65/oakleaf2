# 🚀 Oakleaf Funnel Platform - Deployment Guide

## Phase 8: Professional Page Builder System - Deployed! ✅

This guide will help you deploy the Oakleaf platform with a custom PostgreSQL Docker container.

---

## 📋 Prerequisites

- Docker Desktop installed on your Mac
- Node.js 18+ installed
- Git

---

## 🐳 Step 1: Setup Custom PostgreSQL Container (Run on your Mac)

Since you already have PostgreSQL on default port 5432, we'll use **port 5433** for this project.

```bash
# Navigate to project directory
cd /path/to/oakleaf2

# Create Docker volume for data persistence
docker volume create oakleaf-postgres-data

# Create custom network
docker network create oakleaf-network

# Start PostgreSQL container on port 5433
docker run -d \
  --name oakleaf-postgres \
  --network oakleaf-network \
  -e POSTGRES_USER=oakleaf_user \
  -e POSTGRES_PASSWORD=oakleaf_secure_pass_2024 \
  -e POSTGRES_DB=oakleaf_funnel_db \
  -p 5433:5432 \
  -v oakleaf-postgres-data:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:15-alpine

# Verify it's running
docker ps | grep oakleaf-postgres
```

**Expected Output:**
```
CONTAINER ID   IMAGE               STATUS          PORTS                    NAMES
abc123...      postgres:15-alpine  Up 10 seconds   0.0.0.0:5433->5432/tcp   oakleaf-postgres
```

---

## ⚙️ Step 2: Configure Backend

The `.env` file has already been configured with these settings:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=oakleaf_user
DB_PASSWORD=oakleaf_secure_pass_2024
DB_NAME=oakleaf_funnel_db
```

If you need to change anything, edit: `backend/.env`

---

## 📦 Step 3: Install Dependencies

```bash
cd backend
npm install
```

---

## ▶️ Step 4: Start the Application

The application will **automatically create all database tables** (including Phase 8 page builder tables) on first run:

```bash
# Development mode with hot-reload
npm run start:dev

# OR Production build
npm run build
npm run start:prod
```

**Expected Output:**
```
[Nest] Starting Nest application...
[TypeOrmModule] Successfully connected to database
[NestApplication] Nest application successfully started
[NestApplication] Application is running on: http://localhost:3000
```

---

## ✅ Step 5: Verify Deployment

### Test API Health:
```bash
curl http://localhost:3000/api/v1/health
```

### Check Database Tables:
```bash
# Connect to PostgreSQL
docker exec -it oakleaf-postgres psql -U oakleaf_user -d oakleaf_funnel_db

# List all tables
\dt

# You should see 50+ tables including:
# - page_elements
# - page_blocks
# - template_categories
# - template_reviews
# - page_popups
# - media_assets
# - page_forms
# - form_submissions
# - page_themes

# Exit
\q
```

---

## 🎨 Step 6: Test Phase 8 Features

### API Base URL:
`http://localhost:3000/api/v1`

### Authentication Required:
Most endpoints require a JWT token. First, create a user and login:

```bash
# Register a user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@oakleaf.com",
    "password": "SecurePass123!",
    "firstName": "Admin",
    "lastName": "User"
  }'

# Login to get token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@oakleaf.com",
    "password": "SecurePass123!"
  }'

# Save the token from response
export TOKEN="your-jwt-token-here"
```

### Test Page Builder Endpoints:

```bash
# List available element types
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/funnels/page-builder/elements

# Get available blocks
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/funnels/page-builder/blocks

# Browse templates
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/funnels/page-builder/templates

# List themes
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/funnels/page-builder/themes

# View forms
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/funnels/page-builder/forms

# Browse media library
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/funnels/page-builder/media
```

---

## 🔧 Docker Management Commands

### Container Management:
```bash
# Start container
docker start oakleaf-postgres

# Stop container
docker stop oakleaf-postgres

# Restart container
docker restart oakleaf-postgres

# View logs
docker logs oakleaf-postgres
docker logs -f oakleaf-postgres  # Follow logs

# Check status
docker ps -a | grep oakleaf-postgres

# Container stats
docker stats oakleaf-postgres --no-stream
```

### Database Operations:
```bash
# Connect to PostgreSQL CLI
docker exec -it oakleaf-postgres psql -U oakleaf_user -d oakleaf_funnel_db

# Create backup
docker exec oakleaf-postgres pg_dump -U oakleaf_user oakleaf_funnel_db > backup_$(date +%Y%m%d).sql

# Restore from backup
cat backup_20241030.sql | docker exec -i oakleaf-postgres psql -U oakleaf_user oakleaf_funnel_db

# View database size
docker exec oakleaf-postgres psql -U oakleaf_user -d oakleaf_funnel_db -c "SELECT pg_size_pretty(pg_database_size('oakleaf_funnel_db'));"
```

### Network & Volume Info:
```bash
# View network
docker network inspect oakleaf-network

# View volume
docker volume inspect oakleaf-postgres-data

# Check volume size
docker system df -v | grep oakleaf-postgres-data
```

---

## 🗄️ Database Schema

### Phase 8 New Tables (9 tables):
1. **page_elements** - Page builder elements (30+ types)
2. **page_blocks** - Reusable sections/blocks
3. **template_categories** - Template organization
4. **template_reviews** - Template ratings & reviews
5. **page_popups** - Popup configurations
6. **media_assets** - Media library
7. **page_forms** - Form definitions
8. **form_submissions** - Form submission data
9. **page_themes** - Theme configurations

### All Previous Tables (40+ tables):
- Funnels, Pages, Analytics
- Affiliate system (programs, links, commissions)
- CRM (contacts, tags, segments, activities)
- Products, Orders, Carts
- Email campaigns and templates
- And more...

---

## 🎯 Phase 8 Features

### 🎨 Professional Page Builder
- **30+ Element Types**: heading, paragraph, button, form, video, countdown, testimonial, pricing table, carousel, and more
- **Drag & Drop**: Nested elements with parent-child relationships
- **Responsive Design**: Mobile/tablet/desktop overrides
- **Conditional Visibility**: Show/hide based on segments/tags
- **Animations**: Fade, slide, zoom effects

### 📚 Template Library & Marketplace
- **Save as Template**: Convert any funnel into reusable template
- **Template Categories**: Organize by industry/type
- **Ratings & Reviews**: 5-star rating system
- **Clone Templates**: One-click funnel creation
- **Public/Private**: Share or keep private

### 📝 Advanced Form Builder
- **Multi-Step Forms**: Wizard-style forms
- **15+ Field Types**: text, email, phone, date, rating, slider, signature, etc.
- **Conditional Logic**: Show/hide fields dynamically
- **CRM Integration**: Auto-create/update contacts
- **Email & Webhooks**: Notifications and integrations
- **Analytics**: Conversion rates, completion time, field dropoff

### 🎯 Popup Builder
- **Trigger Types**: Exit intent, time delay, scroll %, click element
- **Popup Styles**: Modal, slide-in, banner, fullscreen
- **Frequency Control**: Once, per session, always
- **Analytics**: Views, conversions, conversion rate

### 🖼️ Media Library
- **Asset Management**: Images, videos, audio, documents, fonts
- **Organization**: Folders and tags
- **Search & Filter**: Quick asset discovery
- **Usage Tracking**: See where assets are used

### 🎨 Theme System
- **Design Systems**: Colors, typography, spacing
- **Component Styles**: Buttons, forms, cards
- **Dark Mode**: Optional dark theme support
- **Custom CSS**: Inject custom styles
- **Apply Globally**: Theme entire funnels or single pages

---

## 🔌 API Endpoints (70+ new endpoints)

All endpoints are prefixed with: `/api/v1/funnels/page-builder`

### Page Elements:
- `POST /elements` - Create element
- `GET /elements/:id` - Get element
- `PUT /elements/:id` - Update element
- `DELETE /elements/:id` - Delete element
- `GET /pages/:pageId/elements` - Get all elements for page
- `POST /elements/duplicate` - Duplicate element
- `POST /pages/:pageId/elements/reorder` - Reorder elements

### Blocks:
- `POST /blocks` - Create block
- `GET /blocks` - List blocks (filter by category)
- `GET /blocks/:id` - Get block
- `PUT /blocks/:id` - Update block
- `DELETE /blocks/:id` - Delete block
- `POST /blocks/add-to-page` - Add block to page

### Templates:
- `POST /templates/categories` - Create category
- `GET /templates/categories` - List categories
- `POST /templates/save-funnel` - Save funnel as template
- `POST /templates/clone` - Clone template to create funnel
- `GET /templates` - Browse templates
- `GET /templates/:id` - Get template details
- `POST /templates/:id/reviews` - Add review
- `PUT /templates/reviews/:id` - Update review

### Forms:
- `POST /forms` - Create form
- `GET /forms` - List forms
- `GET /forms/:id` - Get form
- `PUT /forms/:id` - Update form
- `DELETE /forms/:id` - Delete form
- `POST /forms/submit` - Submit form (public endpoint)
- `GET /forms/:id/submissions` - View submissions
- `GET /forms/submissions/:id` - Get submission details

### Popups:
- `POST /popups` - Create popup
- `GET /popups` - List popups
- `GET /popups/:id` - Get popup
- `PUT /popups/:id` - Update popup
- `DELETE /popups/:id` - Delete popup
- `POST /popups/:id/track-view` - Track view
- `POST /popups/:id/track-conversion` - Track conversion

### Media:
- `POST /media` - Upload asset
- `GET /media` - Browse assets (search, filter, pagination)
- `GET /media/:id` - Get asset details
- `PUT /media/:id` - Update asset metadata
- `DELETE /media/:id` - Delete asset
- `GET /media/folders/list` - List folders
- `GET /media/tags/list` - List tags

### Themes:
- `POST /themes` - Create theme
- `GET /themes` - List themes
- `GET /themes/:id` - Get theme
- `PUT /themes/:id` - Update theme
- `DELETE /themes/:id` - Delete theme
- `POST /themes/apply` - Apply theme to funnel/page
- `POST /themes/:id/duplicate` - Duplicate theme

---

## 🔒 Security Notes

### Change Default Credentials:
Before deploying to production, update these in `.env`:
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing key
- `STRIPE_SECRET_KEY` - If using Stripe
- `SENDGRID_API_KEY` - If using SendGrid

### Production Checklist:
- [ ] Set `NODE_ENV=production`
- [ ] Change all default passwords
- [ ] Generate strong JWT secret
- [ ] Configure CORS for your frontend domain
- [ ] Enable SSL/TLS for database connection
- [ ] Set up proper backup schedule
- [ ] Configure monitoring (Sentry, etc.)
- [ ] Set up rate limiting appropriately
- [ ] Review and harden security settings

---

## 🚨 Troubleshooting

### Container won't start:
```bash
# Check if port 5433 is already in use
lsof -i :5433

# Check container logs
docker logs oakleaf-postgres

# Restart container
docker restart oakleaf-postgres
```

### Application can't connect to database:
```bash
# Verify container is running
docker ps | grep oakleaf-postgres

# Test connection
docker exec oakleaf-postgres pg_isready -U oakleaf_user

# Check backend logs
# Look for connection errors
```

### Reset everything:
```bash
# Stop and remove container
docker stop oakleaf-postgres
docker rm oakleaf-postgres

# Remove volume (WARNING: deletes all data!)
docker volume rm oakleaf-postgres-data

# Run setup again
./docker-setup.sh
```

---

## 📚 Additional Resources

- **Backend Port**: 3000
- **Database Port**: 5433 (custom, not default 5432)
- **Network**: oakleaf-network
- **Volume**: oakleaf-postgres-data

---

## 🎉 You're All Set!

Your Oakleaf Funnel Platform with Phase 8 Professional Page Builder is ready to use!

### Quick Start:
```bash
# 1. Start PostgreSQL (on your Mac)
docker start oakleaf-postgres

# 2. Start Backend
cd backend
npm run start:dev

# 3. Access API
# http://localhost:3000/api/v1
```

---

Built with ❤️ using NestJS, TypeORM, and PostgreSQL
