#!/bin/bash

echo "🚀 Setting up BuildHub with local PostgreSQL..."

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first:"
    echo "   - macOS: brew services start postgresql"
    echo "   - Linux: sudo systemctl start postgresql"
    echo "   - Windows: Start PostgreSQL service"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create database and user
echo "📦 Setting up database..."
psql -U postgres -c "CREATE DATABASE buildhub;" 2>/dev/null || echo "Database already exists"
psql -U postgres -c "CREATE USER buildhub_user WITH PASSWORD 'buildhub_password';" 2>/dev/null || echo "User already exists"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE buildhub TO buildhub_user;" 2>/dev/null

# Set up Python virtual environment
echo "🐍 Setting up Python environment..."
cd backend
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Set up environment variables
echo "⚙️ Setting up environment..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "DB_HOST=localhost" >> .env
    echo "DB_USER=buildhub_user" >> .env
    echo "DB_PASSWORD=buildhub_password" >> .env
fi

# Run Django setup
echo "🔧 Setting up Django..."
python manage.py makemigrations
python manage.py migrate

# Create superuser
echo "👤 Creating superuser..."
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('✅ Superuser created: admin/admin123')
else:
    print('✅ Superuser already exists: admin/admin123')
"

# Create sample categories
echo "📂 Creating sample categories..."
python manage.py shell -c "
from api.models import Category
categories = ['Arduino', 'Raspberry Pi', '3D Printing', 'IoT', 'Electronics', 'Woodworking', 'Automation']
for cat_name in categories:
    if not Category.objects.filter(name=cat_name).exists():
        Category.objects.create(name=cat_name)
        print(f'✅ Created category: {cat_name}')
"

cd ..

# Set up React frontend
echo "⚛️ Setting up React frontend..."
npm install

echo "✅ Setup completed successfully!"
echo ""
echo "🚀 To start the application:"
echo "   Backend:  cd backend && source venv/bin/activate && python manage.py runserver"
echo "   Frontend: npm run dev"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000/api/"
echo "   Django Admin: http://localhost:8000/admin/ (admin/admin123)" 