#!/bin/bash

# Fix PostgreSQL Permissions Script
# This script grants the necessary permissions to the buildhub_user

set -e

echo "Fix PostgreSQL Permissions"
echo "=========================="

# Database configuration
DB_NAME="buildhub"
DB_USER="buildhub_user"

echo "Granting permissions to user: $DB_USER"
echo "Database: $DB_NAME"

# Grant schema permissions
echo "Granting schema permissions..."
psql -U postgres -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;" || echo "Schema privileges might already be granted"
psql -U postgres -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;" || echo "Table privileges might already be granted"
psql -U postgres -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;" || echo "Sequence privileges might already be granted"
psql -U postgres -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;" || echo "Default table privileges might already be granted"
psql -U postgres -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;" || echo "Default sequence privileges might already be granted"

echo "✅ Permissions fixed successfully!"
echo ""
echo "You can now run the migration again:"
echo "python migrate_now.py" 