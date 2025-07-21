#!/bin/bash

echo "🐳 Setting up BuildHub with Docker..."

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove volumes to ensure clean start
echo "🧹 Cleaning up volumes..."
docker volume rm buildhub_frontend_node_modules 2>/dev/null || true

# Build and start the services
echo "📦 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 20

# Ensure frontend dependencies are installed and cache is cleared
echo "📦 Installing frontend dependencies..."
docker-compose exec frontend sh -c "rm -rf node_modules/.vite && npm ci"

# Run migrations
echo "🗄️ Running database migrations..."
docker-compose exec backend python manage.py migrate

# Create superuser if it doesn't exist
echo "👤 Creating superuser (admin/admin123)..."
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('✅ Superuser created successfully!')
else:
    print('ℹ️ Superuser already exists!')
"

# Create sample categories
echo "📂 Creating sample categories..."
docker-compose exec backend python manage.py shell -c "
from api.models import Category
categories = ['Arduino', 'Raspberry Pi', '3D Printing', 'IoT', 'Electronics', 'Woodworking', 'Automation']
for cat_name in categories:
    if not Category.objects.filter(name=cat_name).exists():
        Category.objects.create(name=cat_name)
        print(f'✅ Created category: {cat_name}')
    else:
        print(f'ℹ️ Category already exists: {cat_name}')
"

echo "✅ Setup completed successfully!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000/api/"
echo "   Django Admin: http://localhost:8000/admin/ (admin/admin123)"
echo ""
echo "📝 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Rebuild: docker-compose up --build"
echo "   Frontend logs: docker-compose logs -f frontend"
echo "   Backend logs: docker-compose logs -f backend"
echo "   Fix Vite cache: ./fix-vite-cache.sh" 