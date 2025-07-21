#!/usr/bin/env python3
"""
Check Database Content Script
This script shows what's actually in the PostgreSQL database
"""

import os
import sys
import django
from django.conf import settings

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'buildhub_backend.settings')
    django.setup()

def check_database_content():
    """Check what's in the database"""
    print("🔍 Checking PostgreSQL Database Content")
    print("=" * 40)
    
    try:
        from django.contrib.auth.models import User
        from api.models import Category, Project, ProjectMember, WorkAttribution, BillOfMaterialItem, Attachment, Comment, Message, UserProfile, Bookmark
        
        # Check users
        users = User.objects.all()
        print(f"\n👥 Users ({users.count()}):")
        for user in users:
            print(f"  - {user.username} ({user.email}) - {'Superuser' if user.is_superuser else 'Regular user'}")
        
        # Check categories
        categories = Category.objects.all()
        print(f"\n📂 Categories ({categories.count()}):")
        for cat in categories:
            print(f"  - {cat.name}")
        
        # Check projects
        projects = Project.objects.all()
        print(f"\n📁 Projects ({projects.count()}):")
        for proj in projects:
            print(f"  - {proj.title} by {proj.author.username} ({proj.status})")
        
        # Check other models
        print(f"\n📊 Other Data:")
        print(f"  - Project Members: {ProjectMember.objects.count()}")
        print(f"  - Work Attributions: {WorkAttribution.objects.count()}")
        print(f"  - Bill of Materials: {BillOfMaterialItem.objects.count()}")
        print(f"  - Attachments: {Attachment.objects.count()}")
        print(f"  - Comments: {Comment.objects.count()}")
        print(f"  - Messages: {Message.objects.count()}")
        print(f"  - User Profiles: {UserProfile.objects.count()}")
        print(f"  - Bookmarks: {Bookmark.objects.count()}")
        
        return True
    except Exception as e:
        print(f"❌ Error checking database: {e}")
        return False

def check_sqlite_backup():
    """Check if we have the original SQLite data"""
    print("\n🔍 Checking SQLite Backup")
    print("=" * 30)
    
    sqlite_backup = 'db.sqlite3.backup'
    if os.path.exists(sqlite_backup):
        print(f"✅ SQLite backup exists: {sqlite_backup}")
        
        # Try to read SQLite backup
        try:
            import sqlite3
            conn = sqlite3.connect(sqlite_backup)
            cursor = conn.cursor()
            
            # Check users in SQLite
            cursor.execute("SELECT username, email, is_superuser FROM auth_user")
            sqlite_users = cursor.fetchall()
            print(f"\n👥 Users in SQLite backup ({len(sqlite_users)}):")
            for username, email, is_superuser in sqlite_users:
                user_type = "Superuser" if is_superuser else "Regular user"
                print(f"  - {username} ({email}) - {user_type}")
            
            # Check projects in SQLite
            cursor.execute("SELECT title, author_id, status FROM api_project")
            sqlite_projects = cursor.fetchall()
            print(f"\n📁 Projects in SQLite backup ({len(sqlite_projects)}):")
            for title, author_id, status in sqlite_projects:
                print(f"  - {title} (Author ID: {author_id}, Status: {status})")
            
            conn.close()
            return True
        except Exception as e:
            print(f"❌ Error reading SQLite backup: {e}")
            return False
    else:
        print("❌ No SQLite backup found")
        return False

def main():
    """Main function"""
    setup_django()
    
    print("Current Database Settings:")
    print(f"  Engine: {settings.DATABASES['default']['ENGINE']}")
    print(f"  Database: {settings.DATABASES['default']['NAME']}")
    print(f"  USE_SQLITE: {os.environ.get('USE_SQLITE', 'Not set')}")
    
    check_database_content()
    check_sqlite_backup()
    
    print("\n" + "="*50)
    print("SUMMARY:")
    print("="*50)
    print("If you see fewer users in PostgreSQL than in SQLite backup,")
    print("the data migration may have been incomplete or failed.")
    print("\nTo re-migrate data, run:")
    print("python migrate_data_manually.py")

if __name__ == '__main__':
    main() 