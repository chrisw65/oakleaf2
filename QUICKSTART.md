# Running OakLeaf2 Platform - Quick Start Guide

## ⚠️ Port Conflicts

You mentioned having conflicts with:
- PostgreSQL on port 5432
- Another application on port 3000

This guide provides two options to run the application.

---

## Option 1: Run with Docker (Recommended - No Conflicts)

All services use non-conflicting ports:

```bash
# Start all services
docker compose up -d

# Or start specific services
docker compose up -d postgres redis backend

# View logs
docker compose logs -f
```

### Docker Port Mappings:
- **PostgreSQL**: `localhost:5435` (avoids 5432)
- **Redis**: `localhost:6380` (avoids 6379)
- **Backend API**: `localhost:3001`
- **Frontend**: `localhost:3002` (avoids 3000)
- **Adminer** (DB Admin): `localhost:8082`
- **MinIO API**: `localhost:9002`
- **MinIO Console**: `localhost:9003`

### Access Points:
- Frontend: http://localhost:3002
- Backend API: http://localhost:3001
- Database Admin: http://localhost:8082

See [README-DOCKER.md](./README-DOCKER.md) for full Docker documentation.

---

## Option 2: Run Locally (Without Docker)

If not using Docker, you'll need to change ports to avoid conflicts.

### Backend Setup

1. **Install dependencies** (if not done):
   ```bash
   cd backend
   npm install
   ```

2. **Create/update backend/.env**:
   ```bash
   # Use non-conflicting ports
   PORT=3001
   DB_HOST=localhost
   DB_PORT=5435  # Or your PostgreSQL port
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=your_database

   REDIS_HOST=localhost
   REDIS_PORT=6380  # Or your Redis port

   JWT_SECRET=your-secret-key
   ```

3. **Start backend**:
   ```bash
   npm run start:dev
   ```

### Frontend Setup

1. **Install dependencies** (already done ✅)

2. **Change React port** (to avoid 3000):

   **Option A** - Set PORT environment variable:
   ```bash
   # In frontend directory
   PORT=3002 npm start
   ```

   **Option B** - Create frontend/.env:
   ```bash
   PORT=3002
   REACT_APP_API_URL=http://localhost:3001/api
   ```

3. **Start frontend**:
   ```bash
   npm start
   ```

### Required Services

You also need PostgreSQL and Redis running:

**PostgreSQL**: Make sure you have a database created
```bash
# If using existing PostgreSQL
createdb funnel_platform
```

**Redis**: Must be running on localhost:6379 or update REDIS_PORT in backend/.env

---

## Current Status

✅ **Backend**:
- Dependencies installed
- TypeScript compiles successfully
- Ready to run with `npm run start:dev`
- Needs PostgreSQL and Redis running

✅ **Frontend**:
- Dependencies installed ✅
- Compiles successfully ✅
- Currently would start on port 3000 (conflicts with your app)
- Use `PORT=3002 npm start` to use different port

---

## Quick Commands

### Start Backend (local):
```bash
cd backend
npm run start:dev
```

### Start Frontend (local, different port):
```bash
cd frontend
PORT=3002 npm start
```

### Start Everything with Docker:
```bash
docker compose up -d
```

---

## Troubleshooting

### "Port 3000 is already in use"
```bash
# Use different port
PORT=3002 npm start
```

### "Cannot connect to PostgreSQL"
- Check PostgreSQL is running
- Verify connection settings in backend/.env
- For Docker: ensure `docker compose up postgres` is running

### "Cannot connect to Redis"
- Check Redis is running: `redis-cli ping` should return `PONG`
- For Docker: ensure `docker compose up redis` is running

### Backend won't start
```bash
# Check what's on port 3001
lsof -i :3001

# Check logs
npm run start:dev
```

---

## Recommended Workflow

For development with no conflicts:

1. **Start Docker services**:
   ```bash
   docker compose up -d postgres redis
   ```

2. **Run backend locally** (for hot reload):
   ```bash
   cd backend
   npm run start:dev
   ```

3. **Run frontend locally** (for hot reload):
   ```bash
   cd frontend
   PORT=3002 npm start
   ```

4. **Access**:
   - Frontend: http://localhost:3002
   - Backend: http://localhost:3001
   - Database: localhost:5435 (via Docker)
   - Redis: localhost:6380 (via Docker)

This gives you hot reload for code changes while using Docker for databases!
