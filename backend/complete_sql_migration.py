#!/usr/bin/env python3
"""
Complete SQL Migration Script
This script transfers ALL data from SQLite to PostgreSQL including related models
"""

import os
import sys
import django
import sqlite3
from django.conf import settings
from django.db import connection

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'buildhub_backend.settings')
    django.setup()

def migrate_users():
    """Migrate users directly using SQL"""
    print("👥 Migrating users...")
    
    try:
        sqlite_conn = sqlite3.connect('db.sqlite3.backup')
        sqlite_cursor = sqlite_conn.cursor()
        
        sqlite_cursor.execute("""
            SELECT id, password, last_login, is_superuser, username, first_name, 
                   last_name, email, is_staff, is_active, date_joined 
            FROM auth_user
        """)
        users = sqlite_cursor.fetchall()
        
        print(f"Found {len(users)} users in SQLite")
        
        with connection.cursor() as pg_cursor:
            for user_data in users:
                user_id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined = user_data
                
                pg_cursor.execute("""
                    INSERT INTO auth_user (id, password, last_login, is_superuser, username, 
                                         first_name, last_name, email, is_staff, is_active, date_joined)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, (
                    user_id, password, last_login, 
                    bool(is_superuser), username, first_name, last_name, email, 
                    bool(is_staff), bool(is_active), date_joined
                ))
        
        sqlite_conn.close()
        print("✅ Users migrated successfully")
        return True
    except Exception as e:
        print(f"❌ Error migrating users: {e}")
        return False

def migrate_categories():
    """Migrate categories directly using SQL"""
    print("📂 Migrating categories...")
    
    try:
        sqlite_conn = sqlite3.connect('db.sqlite3.backup')
        sqlite_cursor = sqlite_conn.cursor()
        
        sqlite_cursor.execute("SELECT id, name FROM api_category")
        categories = sqlite_cursor.fetchall()
        
        print(f"Found {len(categories)} categories in SQLite")
        
        with connection.cursor() as pg_cursor:
            for category_data in categories:
                pg_cursor.execute("""
                    INSERT INTO api_category (id, name)
                    VALUES (%s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, category_data)
        
        sqlite_conn.close()
        print("✅ Categories migrated successfully")
        return True
    except Exception as e:
        print(f"❌ Error migrating categories: {e}")
        return False

def migrate_projects():
    """Migrate projects directly using SQL"""
    print("📁 Migrating projects...")
    
    try:
        sqlite_conn = sqlite3.connect('db.sqlite3.backup')
        sqlite_cursor = sqlite_conn.cursor()
        
        sqlite_cursor.execute("""
            SELECT id, title, description, elevator_pitch, story_content, cover_image, 
                   author_id, category_id, difficulty, status, created_at, updated_at
            FROM api_project
        """)
        projects = sqlite_cursor.fetchall()
        
        print(f"Found {len(projects)} projects in SQLite")
        
        with connection.cursor() as pg_cursor:
            for project_data in projects:
                pg_cursor.execute("""
                    INSERT INTO api_project (id, title, description, elevator_pitch, story_content, 
                                           cover_image, author_id, category_id, difficulty, status, 
                                           created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, project_data)
        
        sqlite_conn.close()
        print("✅ Projects migrated successfully")
        return True
    except Exception as e:
        print(f"❌ Error migrating projects: {e}")
        return False

def migrate_user_profiles():
    """Migrate user profiles directly using SQL"""
    print("👤 Migrating user profiles...")
    
    try:
        sqlite_conn = sqlite3.connect('db.sqlite3.backup')
        sqlite_cursor = sqlite_conn.cursor()
        
        sqlite_cursor.execute("""
            SELECT id, user_id, bio, skills, location, avatar
            FROM api_userprofile
        """)
        profiles = sqlite_cursor.fetchall()
        
        print(f"Found {len(profiles)} user profiles in SQLite")
        
        with connection.cursor() as pg_cursor:
            for profile_data in profiles:
                pg_cursor.execute("""
                    INSERT INTO api_userprofile (id, user_id, bio, skills, location, avatar)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, profile_data)
        
        sqlite_conn.close()
        print("✅ User profiles migrated successfully")
        return True
    except Exception as e:
        print(f"❌ Error migrating user profiles: {e}")
        return False

def migrate_project_members():
    """Migrate project members directly using SQL"""
    print("👥 Migrating project members...")
    
    try:
        sqlite_conn = sqlite3.connect('db.sqlite3.backup')
        sqlite_cursor = sqlite_conn.cursor()
        
        sqlite_cursor.execute("""
            SELECT id, project_id, user_id, role, contribution, joined_at
            FROM api_projectmember
        """)
        members = sqlite_cursor.fetchall()
        
        print(f"Found {len(members)} project members in SQLite")
        
        with connection.cursor() as pg_cursor:
            for member_data in members:
                pg_cursor.execute("""
                    INSERT INTO api_projectmember (id, project_id, user_id, role, contribution, joined_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, member_data)
        
        sqlite_conn.close()
        print("✅ Project members migrated successfully")
        return True
    except Exception as e:
        print(f"❌ Error migrating project members: {e}")
        return False

def migrate_work_attributions():
    """Migrate work attributions directly using SQL"""
    print("📝 Migrating work attributions...")
    
    try:
        sqlite_conn = sqlite3.connect('db.sqlite3.backup')
        sqlite_cursor = sqlite_conn.cursor()
        
        sqlite_cursor.execute("""
            SELECT id, project_id, contributor_name, credit_description, link, created_at
            FROM api_workattribution
        """)
        attributions = sqlite_cursor.fetchall()
        
        print(f"Found {len(attributions)} work attributions in SQLite")
        
        with connection.cursor() as pg_cursor:
            for attribution_data in attributions:
                pg_cursor.execute("""
                    INSERT INTO api_workattribution (id, project_id, contributor_name, credit_description, link, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, attribution_data)
        
        sqlite_conn.close()
        print("✅ Work attributions migrated successfully")
        return True
    except Exception as e:
        print(f"❌ Error migrating work attributions: {e}")
        return False

def migrate_bill_of_materials():
    """Migrate bill of materials directly using SQL"""
    print("📦 Migrating bill of materials...")
    
    try:
        sqlite_conn = sqlite3.connect('db.sqlite3.backup')
        sqlite_cursor = sqlite_conn.cursor()
        
        sqlite_cursor.execute("""
            SELECT id, project_id, item_type, name, description, quantity, image, link, created_at
            FROM api_billofmaterialitem
        """)
        items = sqlite_cursor.fetchall()
        
        print(f"Found {len(items)} bill of material items in SQLite")
        
        with connection.cursor() as pg_cursor:
            for item_data in items:
                pg_cursor.execute("""
                    INSERT INTO api_billofmaterialitem (id, project_id, item_type, name, description, quantity, image, link, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, item_data)
        
        sqlite_conn.close()
        print("✅ Bill of materials migrated successfully")
        return True
    except Exception as e:
        print(f"❌ Error migrating bill of materials: {e}")
        return False

def migrate_attachments():
    """Migrate attachments directly using SQL"""
    print("📎 Migrating attachments...")
    
    try:
        sqlite_conn = sqlite3.connect('db.sqlite3.backup')
        sqlite_cursor = sqlite_conn.cursor()
        
        sqlite_cursor.execute("""
            SELECT id, project_id, attachment_type, title, file_upload, repository_link, description, created_at
            FROM api_attachment
        """)
        attachments = sqlite_cursor.fetchall()
        
        print(f"Found {len(attachments)} attachments in SQLite")
        
        with connection.cursor() as pg_cursor:
            for attachment_data in attachments:
                pg_cursor.execute("""
                    INSERT INTO api_attachment (id, project_id, attachment_type, title, file_upload, repository_link, description, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, attachment_data)
        
        sqlite_conn.close()
        print("✅ Attachments migrated successfully")
        return True
    except Exception as e:
        print(f"❌ Error migrating attachments: {e}")
        return False

def migrate_comments():
    """Migrate comments directly using SQL"""
    print("💬 Migrating comments...")
    
    try:
        sqlite_conn = sqlite3.connect('db.sqlite3.backup')
        sqlite_cursor = sqlite_conn.cursor()
        
        sqlite_cursor.execute("""
            SELECT id, project_id, author_id, parent_id, body, created_at
            FROM api_comment
        """)
        comments = sqlite_cursor.fetchall()
        
        print(f"Found {len(comments)} comments in SQLite")
        
        with connection.cursor() as pg_cursor:
            for comment_data in comments:
                pg_cursor.execute("""
                    INSERT INTO api_comment (id, project_id, author_id, parent_id, body, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, comment_data)
        
        sqlite_conn.close()
        print("✅ Comments migrated successfully")
        return True
    except Exception as e:
        print(f"❌ Error migrating comments: {e}")
        return False

def migrate_messages():
    """Migrate messages directly using SQL"""
    print("📨 Migrating messages...")
    
    try:
        sqlite_conn = sqlite3.connect('db.sqlite3.backup')
        sqlite_cursor = sqlite_conn.cursor()
        
        sqlite_cursor.execute("""
            SELECT id, recipient_id, sender_id, message_type, title, content, 
                   related_project_id, related_comment_id, is_read, created_at
            FROM api_message
        """)
        messages = sqlite_cursor.fetchall()
        
        print(f"Found {len(messages)} messages in SQLite")
        
        with connection.cursor() as pg_cursor:
            for message_data in messages:
                msg_id, recipient_id, sender_id, message_type, title, content, related_project_id, related_comment_id, is_read, created_at = message_data
                
                pg_cursor.execute("""
                    INSERT INTO api_message (id, recipient_id, sender_id, message_type, title, content, 
                                           related_project_id, related_comment_id, is_read, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, (msg_id, recipient_id, sender_id, message_type, title, content, 
                      related_project_id, related_comment_id, bool(is_read), created_at))
        
        sqlite_conn.close()
        print("✅ Messages migrated successfully")
        return True
    except Exception as e:
        print(f"❌ Error migrating messages: {e}")
        return False

def migrate_bookmarks():
    """Migrate bookmarks directly using SQL"""
    print("🔖 Migrating bookmarks...")
    
    try:
        sqlite_conn = sqlite3.connect('db.sqlite3.backup')
        sqlite_cursor = sqlite_conn.cursor()
        
        sqlite_cursor.execute("""
            SELECT id, user_id, project_id, created_at
            FROM api_bookmark
        """)
        bookmarks = sqlite_cursor.fetchall()
        
        print(f"Found {len(bookmarks)} bookmarks in SQLite")
        
        with connection.cursor() as pg_cursor:
            for bookmark_data in bookmarks:
                pg_cursor.execute("""
                    INSERT INTO api_bookmark (id, user_id, project_id, created_at)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, bookmark_data)
        
        sqlite_conn.close()
        print("✅ Bookmarks migrated successfully")
        return True
    except Exception as e:
        print(f"❌ Error migrating bookmarks: {e}")
        return False

def main():
    """Main migration function"""
    print("🔄 Complete SQL Migration")
    print("=" * 30)
    
    setup_django()
    
    # Ensure we're using PostgreSQL
    os.environ['USE_SQLITE'] = 'False'
    
    # Migrate data in order (respecting foreign keys)
    steps = [
        ("Users", migrate_users),
        ("Categories", migrate_categories),
        ("Projects", migrate_projects),
        ("User Profiles", migrate_user_profiles),
        ("Project Members", migrate_project_members),
        ("Work Attributions", migrate_work_attributions),
        ("Bill of Materials", migrate_bill_of_materials),
        ("Attachments", migrate_attachments),
        ("Comments", migrate_comments),
        ("Messages", migrate_messages),
        ("Bookmarks", migrate_bookmarks),
    ]
    
    for step_name, step_func in steps:
        print(f"\n{'='*40}")
        print(f"Step: {step_name}")
        print(f"{'='*40}")
        
        if not step_func():
            print(f"❌ {step_name} migration failed")
            return
    
    print(f"\n{'='*40}")
    print("🎉 Complete SQL Migration Completed!")
    print(f"{'='*40}")
    print("All data has been migrated using direct SQL queries.")
    print("Run 'python check_database_content.py' to verify the migration.")

if __name__ == '__main__':
    main() 