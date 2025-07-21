#!/bin/bash

echo "🔧 Fixing Vite cache issues..."

# Stop the frontend container
docker-compose stop frontend

# Remove the frontend container
docker-compose rm -f frontend

# Clear the node_modules volume
docker volume rm buildhub_frontend_node_modules

# Rebuild and start the frontend
docker-compose up --build -d frontend

echo "✅ Vite cache cleared and frontend restarted!"
echo "🌐 Access: http://localhost:5173"
echo ""
echo "📝 If you still see issues, try:"
echo "   docker-compose logs -f frontend" 