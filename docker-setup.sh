#!/bin/bash

# Oakleaf PostgreSQL Docker Setup Script
# This creates a self-contained PostgreSQL instance on port 5433

set -e

echo "🐳 Setting up Oakleaf PostgreSQL Docker Container..."

# Configuration
CONTAINER_NAME="oakleaf-postgres"
VOLUME_NAME="oakleaf-postgres-data"
NETWORK_NAME="oakleaf-network"
POSTGRES_USER="oakleaf_user"
POSTGRES_PASSWORD="oakleaf_secure_pass_2024"
POSTGRES_DB="oakleaf_funnel_db"
HOST_PORT="5433"
CONTAINER_PORT="5432"

# Check if container already exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "⚠️  Container '${CONTAINER_NAME}' already exists."
    read -p "Do you want to remove it and create a new one? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing existing container..."
        docker stop ${CONTAINER_NAME} 2>/dev/null || true
        docker rm ${CONTAINER_NAME} 2>/dev/null || true
        echo "🗑️  Removing existing volume..."
        docker volume rm ${VOLUME_NAME} 2>/dev/null || true
    else
        echo "ℹ️  Using existing container. Run 'docker start ${CONTAINER_NAME}' to start it."
        exit 0
    fi
fi

# Create volume for data persistence
echo "📦 Creating Docker volume '${VOLUME_NAME}'..."
docker volume create ${VOLUME_NAME}

# Create network if it doesn't exist
if ! docker network ls --format '{{.Name}}' | grep -q "^${NETWORK_NAME}$"; then
    echo "🌐 Creating Docker network '${NETWORK_NAME}'..."
    docker network create ${NETWORK_NAME}
else
    echo "✅ Network '${NETWORK_NAME}' already exists"
fi

# Start PostgreSQL container
echo "🚀 Starting PostgreSQL container..."
docker run -d \
  --name ${CONTAINER_NAME} \
  --network ${NETWORK_NAME} \
  -e POSTGRES_USER=${POSTGRES_USER} \
  -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
  -e POSTGRES_DB=${POSTGRES_DB} \
  -p ${HOST_PORT}:${CONTAINER_PORT} \
  -v ${VOLUME_NAME}:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:15-alpine

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if container is running
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "✅ PostgreSQL container is running!"
    echo ""
    echo "📋 Connection Details:"
    echo "   Host: localhost"
    echo "   Port: ${HOST_PORT}"
    echo "   User: ${POSTGRES_USER}"
    echo "   Password: ${POSTGRES_PASSWORD}"
    echo "   Database: ${POSTGRES_DB}"
    echo ""
    echo "🔗 Connection String:"
    echo "   postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${HOST_PORT}/${POSTGRES_DB}"
    echo ""
    echo "📝 Useful Commands:"
    echo "   Start:   docker start ${CONTAINER_NAME}"
    echo "   Stop:    docker stop ${CONTAINER_NAME}"
    echo "   Logs:    docker logs ${CONTAINER_NAME}"
    echo "   Connect: docker exec -it ${CONTAINER_NAME} psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}"
    echo ""
    echo "✨ Ready to run: npm run start:dev"
else
    echo "❌ Failed to start PostgreSQL container"
    docker logs ${CONTAINER_NAME}
    exit 1
fi
