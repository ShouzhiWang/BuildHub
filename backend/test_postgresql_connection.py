#!/usr/bin/env python3
"""
Test script to verify PostgreSQL connection and basic functionality
"""

import os
import sys
import django
from django.conf import settings
from django.db import connection

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'buildhub_backend.settings')
    django.setup()

def test_database_connection():
    """Test database connection"""
    print("Testing PostgreSQL connection...")
    
    try:
        # Test basic connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"✅ PostgreSQL connection successful!")
            print(f"   Version: {version[0]}")
        
        # Test Django ORM
        from django.contrib.auth.models import User
        user_count = User.objects.count()
        print(f"✅ Django ORM working! User count: {user_count}")
        
        # Test custom models
        from api.models import Project, Category
        project_count = Project.objects.count()
        category_count = Category.objects.count()
        print(f"✅ Custom models working!")
        print(f"   Projects: {project_count}")
        print(f"   Categories: {category_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_database_settings():
    """Test database settings"""
    print("\nDatabase Settings:")
    print(f"   Engine: {settings.DATABASES['default']['ENGINE']}")
    print(f"   Name: {settings.DATABASES['default']['NAME']}")
    print(f"   Host: {settings.DATABASES['default']['HOST']}")
    print(f"   Port: {settings.DATABASES['default']['PORT']}")
    print(f"   User: {settings.DATABASES['default']['USER']}")

def main():
    """Main test function"""
    print("BuildHub PostgreSQL Connection Test")
    print("=" * 35)
    
    setup_django()
    test_database_settings()
    
    if test_database_connection():
        print("\n🎉 All tests passed! PostgreSQL is working correctly.")
    else:
        print("\n❌ Tests failed. Please check your PostgreSQL setup.")
        sys.exit(1)

if __name__ == '__main__':
    main() 