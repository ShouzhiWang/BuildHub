# BuildHub PostgreSQL Migration - Quick Start

This directory contains all the tools and scripts needed to migrate your BuildHub application from SQLite to PostgreSQL.

## Quick Migration Steps

### 1. Install PostgreSQL
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# CentOS/RHEL
sudo yum install postgresql postgresql-server
sudo systemctl start postgresql
```

### 2. Set Up Database
```bash
cd backend
./setup_postgresql.sh
```

### 3. Configure Environment
```bash
cp env.example .env
# Edit .env file to set USE_SQLITE=False
```

### 4. Backup Current Data (Optional)
```bash
python export_sqlite_data.py
```

### 5. Run Migrations
```bash
python manage.py migrate
```

### 6. Load Data (Optional)
```bash
python manage.py loaddata sqlite_backup.json
```

### 7. Test Connection
```bash
python test_postgresql_connection.py
```

### 8. Start Application
```bash
python manage.py runserver
```

## Files Overview

- `setup_postgresql.sh` - Automated PostgreSQL database setup
- `export_sqlite_data.py` - Export SQLite data to JSON
- `migrate_to_postgresql.py` - Interactive migration script
- `test_postgresql_connection.py` - Test PostgreSQL connection
- `POSTGRESQL_MIGRATION_GUIDE.md` - Detailed migration guide
- `env.example` - Environment variables template

## Troubleshooting

### Common Issues

1. **PostgreSQL not running**
   ```bash
   pg_isready
   # If not ready, start the service
   ```

2. **Permission denied**
   ```bash
   # Make sure you can connect as postgres user
   sudo -u postgres psql
   ```

3. **Database connection error**
   - Check `.env` file settings
   - Verify database and user exist
   - Test connection manually

### Get Help

- Check the detailed guide: `POSTGRESQL_MIGRATION_GUIDE.md`
- Run the test script: `python test_postgresql_connection.py`
- Check Django logs for error messages

## Benefits of PostgreSQL

- **Better Performance**: Handles concurrent users better
- **Advanced Features**: Full-text search, JSON fields, etc.
- **Scalability**: Can handle larger datasets
- **Production Ready**: Industry standard for production deployments
- **Data Integrity**: Better constraint enforcement

## Next Steps

After successful migration:

1. Monitor application performance
2. Set up regular backups
3. Consider production optimizations
4. Update deployment scripts 