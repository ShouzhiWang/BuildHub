#!/bin/bash

echo "🔧 Fixing frontend dependencies..."

# Stop containers
docker-compose down

# Remove the node_modules volume to force fresh install
docker volume rm buildhub_frontend_node_modules

# Rebuild and start
docker-compose up --build -d

# Wait for services to be ready
sleep 10

# Force install dependencies
docker-compose exec frontend npm ci

echo "✅ Dependencies fixed! The application should now work properly."
echo "🌐 Access: http://localhost:5173" 