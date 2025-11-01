# Docker Setup Guide

This guide explains how to run the Funnel & Affiliate Platform using Docker with non-conflicting ports.

## Port Configuration

To avoid conflicts with existing services, the following ports are used:

| Service | Host Port | Container Port | Purpose |
|---------|-----------|----------------|---------|
| Backend API | 3001 | 3001 | NestJS backend |
| Frontend | 3002 | 3000 | React frontend |
| PostgreSQL | 5434 | 5432 | Database |
| Redis | 6380 | 6379 | Cache & queues |
| Adminer | 8081 | 8080 | Database admin |
| MinIO API | 9002 | 9000 | Object storage |
| MinIO Console | 9003 | 9001 | MinIO admin |

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 1.29+
- At least 4GB RAM available for Docker

## Quick Start

### 1. Start all services

```bash
# Start in background
docker-compose up -d

# Or start with logs
docker-compose up
```

### 2. Start only backend and dependencies

```bash
# Start only what's needed for backend development
docker-compose up -d postgres redis backend
```

### 3. Development mode with hot reload

```bash
# Use the development override
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Service Access

Once running, access the services at:

- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:3002
- **Adminer** (DB Admin): http://localhost:8081
  - System: PostgreSQL
  - Server: postgres
  - Username: funnel_user
  - Password: funnel_password
  - Database: funnel_platform
- **MinIO Console**: http://localhost:9003
  - Username: minioadmin
  - Password: minioadmin123

## Useful Commands

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Rebuild containers
```bash
# Rebuild specific service
docker-compose build backend

# Rebuild all
docker-compose build

# Force rebuild without cache
docker-compose build --no-cache
```

### Stop and remove containers
```bash
# Stop all
docker-compose down

# Stop and remove volumes (CAUTION: deletes all data)
docker-compose down -v
```

### Execute commands in containers
```bash
# Access backend shell
docker-compose exec backend sh

# Run migrations
docker-compose exec backend npm run migration:run

# Access database
docker-compose exec postgres psql -U funnel_user -d funnel_platform
```

### Check container status
```bash
docker-compose ps
```

### Restart a service
```bash
docker-compose restart backend
```

## Database Management

### Using Adminer
1. Open http://localhost:8081
2. Login with credentials from .env file
3. Manage database through web interface

### Using psql directly
```bash
# Connect to database
docker-compose exec postgres psql -U funnel_user -d funnel_platform

# Run SQL file
docker-compose exec -T postgres psql -U funnel_user -d funnel_platform < ./backup.sql
```

### Backup database
```bash
docker-compose exec postgres pg_dump -U funnel_user funnel_platform > backup.sql
```

## Troubleshooting

### Port already in use
If you see "port is already allocated" error:
1. Check which process is using the port: `lsof -i :PORT_NUMBER`
2. Stop the conflicting service or change the port in docker-compose.yml

### Cannot connect to PostgreSQL
```bash
# Check if postgres is healthy
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Verify postgres is accepting connections
docker-compose exec postgres pg_isready -U funnel_user
```

### Backend not starting
```bash
# Check logs
docker-compose logs backend

# Rebuild backend
docker-compose build backend

# Clear node_modules and rebuild
docker-compose down
docker volume ls  # List volumes
docker volume rm oakleaf2_backend_node_modules  # If exists
docker-compose up --build backend
```

### Clear all data and start fresh
```bash
# WARNING: This deletes all data
docker-compose down -v
docker-compose up --build
```

## Environment Variables

Configuration is managed through `.env` file. Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Key variables:
- `DB_PASSWORD`: PostgreSQL password
- `JWT_SECRET`: JWT signing secret
- `REDIS_URL`: Redis connection string

## Production Deployment

For production, use a separate docker-compose.prod.yml:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Ensure you:
1. Change all default passwords
2. Set strong JWT_SECRET
3. Configure proper SSL/TLS
4. Set up proper backups
5. Configure monitoring
6. Use environment-specific .env files

## Network Architecture

All services run on the `funnel-network` Docker network, allowing:
- Services to communicate using container names (e.g., `postgres`, `redis`)
- Isolation from other Docker containers
- Easy service discovery

Internal communication uses container ports, while external access uses host ports.

## Volume Management

Persistent data is stored in Docker volumes:
- `postgres-data`: Database files
- `redis-data`: Redis persistence
- `minio-data`: Uploaded files

To backup volumes:
```bash
docker run --rm -v oakleaf2_postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```
