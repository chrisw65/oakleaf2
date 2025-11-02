# Frontend Docker Setup

The frontend has two Dockerfiles for different purposes:

## Dockerfile.dev (Development)
- Used during development
- Includes hot-reload
- Runs `npm start`
- Uses Node.js to serve
- Watches for file changes

## Dockerfile (Production)
- Multi-stage build
- Creates optimized production build
- Serves with nginx
- Smaller image size
- Better performance

## Building

### Development
```bash
docker compose up frontend
```

### Production
```bash
docker build -f frontend/Dockerfile -t oakleaf-frontend:prod frontend/
docker run -p 3002:3000 oakleaf-frontend:prod
```

## Environment Variables

The following environment variables are available:

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:3001/api)
- `REACT_APP_WS_URL` - WebSocket URL (default: ws://localhost:3001)
- `PORT` - Port to run on (default: 3000)

## Nginx Configuration

The production build uses nginx with:
- React Router support (SPA routing)
- Gzip compression
- Static asset caching
- Security headers
- Health check endpoint at /health

## Hot Reload Issues?

If hot-reload isn't working in Docker:
1. The docker-compose.yml already includes `WATCHPACK_POLLING` and `CHOKIDAR_USEPOLLING`
2. Make sure volumes are properly mounted
3. On Mac/Windows, Docker Desktop file watching should work automatically

## Port Mapping

The frontend container runs on port 3000 internally, but is mapped to port 3002 on the host to avoid conflicts with other applications.
