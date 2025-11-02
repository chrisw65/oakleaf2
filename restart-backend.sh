#!/bin/bash

echo "================================================"
echo "Restarting Backend with Fresh Build"
echo "================================================"
echo ""

echo "Step 1: Stopping containers..."
docker-compose stop backend

echo ""
echo "Step 2: Removing old backend container..."
docker-compose rm -f backend

echo ""
echo "Step 3: Rebuilding backend (this may take a minute)..."
docker-compose build --no-cache backend

echo ""
echo "Step 4: Starting all services..."
docker-compose up -d

echo ""
echo "Step 5: Waiting for backend to start (15 seconds)..."
sleep 15

echo ""
echo "Step 6: Checking backend logs..."
docker-compose logs backend --tail=30

echo ""
echo "================================================"
echo "Backend restart complete!"
echo "================================================"
echo ""
echo "Test the API:"
echo "1. Open: http://localhost:3001/api/docs"
echo "2. Try registering at: http://localhost:3002"
echo ""
