# ⚡ Quick Start Guide - Oakleaf Platform

## 🚀 TL;DR - Get Running in 3 Minutes

### Step 1: Start PostgreSQL (on your Mac)
```bash
docker run -d \
  --name oakleaf-postgres \
  -e POSTGRES_USER=oakleaf_user \
  -e POSTGRES_PASSWORD=oakleaf_secure_pass_2024 \
  -e POSTGRES_DB=oakleaf_funnel_db \
  -p 5433:5432 \
  -v oakleaf-postgres-data:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:15-alpine
```

### Step 2: Start Backend
```bash
cd backend
npm install  # First time only
npm run start:dev
```

### Step 3: Test It
```bash
curl http://localhost:3000/api/v1/health
```

---

## 📝 Daily Commands

### Start Everything:
```bash
docker start oakleaf-postgres
cd backend && npm run start:dev
```

### Stop Everything:
```bash
# Stop backend: Ctrl+C
docker stop oakleaf-postgres
```

### Check Status:
```bash
docker ps | grep oakleaf-postgres
```

---

## 🔗 Important URLs

- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/v1
- **Database**: localhost:5433

---

## 🎯 Common Tasks

### Create a User:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@oakleaf.com",
    "password": "SecurePass123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@oakleaf.com",
    "password": "SecurePass123!"
  }'
```

### Database Backup:
```bash
docker exec oakleaf-postgres pg_dump -U oakleaf_user oakleaf_funnel_db > backup.sql
```

---

## 🆘 Troubleshooting

### Port Already in Use?
```bash
# Find what's using port 5433
lsof -i :5433

# Or use a different port (update .env too)
docker run ... -p 5434:5432 ...
```

### Database Connection Failed?
```bash
# Check if container is running
docker ps | grep oakleaf-postgres

# View logs
docker logs oakleaf-postgres

# Restart it
docker restart oakleaf-postgres
```

### Start Fresh?
```bash
docker stop oakleaf-postgres
docker rm oakleaf-postgres
docker volume rm oakleaf-postgres-data
# Then run Step 1 again
```

---

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete documentation.

---

## ✅ Phase 8 Features

All features are live and accessible via API:

✅ **Page Builder** - 30+ element types
✅ **Template Library** - Save & clone funnels
✅ **Form Builder** - Multi-step forms
✅ **Popup Builder** - Behavioral triggers
✅ **Media Library** - Asset management
✅ **Theme System** - Professional designs

**70+ new API endpoints** under `/api/v1/funnels/page-builder/*`

---

Happy building! 🎉
