#!/bin/bash

# BuildHub PostgreSQL Setup Script
# This script sets up PostgreSQL database and user for BuildHub

set -e

echo "BuildHub PostgreSQL Setup Script"
echo "================================"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install it first:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "  CentOS/RHEL: sudo yum install postgresql postgresql-server"
    exit 1
fi

# Check if PostgreSQL service is running
if ! pg_isready &> /dev/null; then
    echo "PostgreSQL service is not running. Please start it:"
    echo "  macOS: brew services start postgresql"
    echo "  Ubuntu/Debian: sudo systemctl start postgresql"
    echo "  CentOS/RHEL: sudo systemctl start postgresql"
    exit 1
fi

echo "PostgreSQL is installed and running."

# Database configuration
DB_NAME="buildhub"
DB_USER="buildhub_user"
DB_PASSWORD="buildhub_password"

echo "Setting up database: $DB_NAME"
echo "User: $DB_USER"

# Create database and user
echo "Creating database and user..."

# Connect as postgres superuser to create database and user
psql -U postgres -c "CREATE DATABASE $DB_NAME;" || echo "Database might already exist"
psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" || echo "User might already exist"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" || echo "Privileges might already be granted"
psql -U postgres -c "ALTER USER $DB_USER CREATEDB;" || echo "User might already have CREATEDB privilege"

# Grant schema permissions
psql -U postgres -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;" || echo "Schema privileges might already be granted"
psql -U postgres -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;" || echo "Table privileges might already be granted"
psql -U postgres -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;" || echo "Sequence privileges might already be granted"
psql -U postgres -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;" || echo "Default table privileges might already be granted"
psql -U postgres -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;" || echo "Default sequence privileges might already be granted"

echo "PostgreSQL setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Create a .env file with your database credentials"
echo "2. Run: python manage.py migrate"
echo "3. Run: python manage.py createsuperuser (if needed)"
echo ""
echo "Database connection details:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo "  Host: localhost"
echo "  Port: 5432" 