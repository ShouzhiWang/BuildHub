#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z db 5432; do
  echo "Database is not ready - sleeping..."
  sleep 1
done
echo "Database is ready!"

# Run database migrations
echo "Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser if it doesn't exist
echo "Creating superuser..."
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created successfully!')
else:
    print('Superuser already exists!')
"

# Create sample categories
echo "Creating sample categories..."
python manage.py shell -c "
from api.models import Category
categories = ['Arduino', 'Raspberry Pi', '3D Printing', 'IoT', 'Electronics', 'Woodworking', 'Automation']
for cat_name in categories:
    if not Category.objects.filter(name=cat_name).exists():
        Category.objects.create(name=cat_name)
        print(f'Created category: {cat_name}')
"

echo "Setup completed successfully!" 