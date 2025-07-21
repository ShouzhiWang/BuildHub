# BuildHub PostgreSQL Migration Guide

This guide will help you migrate your BuildHub application from SQLite to PostgreSQL.

## Prerequisites

1. **PostgreSQL Installation**
   - macOS: `brew install postgresql`
   - Ubuntu/Debian: `sudo apt-get install postgresql postgresql-contrib`
   - CentOS/RHEL: `sudo yum install postgresql postgresql-server`

2. **Start PostgreSQL Service**
   - macOS: `brew services start postgresql`
   - Ubuntu/Debian: `sudo systemctl start postgresql`
   - CentOS/RHEL: `sudo systemctl start postgresql`

## Migration Steps

### Step 1: Backup Current Data

Before starting the migration, create a backup of your current SQLite database:

```bash
cd backend
python export_sqlite_data.py
```

This will create a `sqlite_backup.json` file with all your current data.

### Step 2: Set Up PostgreSQL Database

Run the PostgreSQL setup script:

```bash
cd backend
chmod +x setup_postgresql.sh
./setup_postgresql.sh
```

This script will:
- Check if PostgreSQL is installed and running
- Create the `buildhub` database
- Create the `buildhub_user` with password `buildhub_password`
- Grant necessary privileges

### Step 3: Configure Environment

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp env.example .env
```

Edit the `.env` file to ensure PostgreSQL settings are correct:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database Settings (PostgreSQL)
USE_SQLITE=False
DB_NAME=buildhub
DB_USER=buildhub_user
DB_PASSWORD=buildhub_password
DB_HOST=localhost
DB_PORT=5432
```

### Step 4: Run Migrations

Apply the database migrations to PostgreSQL:

```bash
cd backend
python manage.py migrate
```

### Step 5: Load Data (Optional)

If you want to migrate your existing data from SQLite:

```bash
cd backend
python manage.py loaddata sqlite_backup.json
```

### Step 6: Create Superuser (if needed)

```bash
cd backend
python manage.py createsuperuser
```

### Step 7: Test the Application

Start the Django development server:

```bash
cd backend
python manage.py runserver
```

Visit `http://localhost:8000` to verify everything is working correctly.

## Verification Steps

1. **Check Database Connection**
   ```bash
   cd backend
   python manage.py dbshell
   ```
   This should connect to PostgreSQL instead of SQLite.

2. **Verify Data Migration**
   - Check that all your projects, users, and other data are present
   - Test creating new projects and users
   - Verify file uploads work correctly

3. **Test API Endpoints**
   - Test all your API endpoints to ensure they work with PostgreSQL
   - Check for any performance improvements

## Troubleshooting

### Common Issues

1. **PostgreSQL Connection Error**
   - Ensure PostgreSQL is running: `pg_isready`
   - Check credentials in `.env` file
   - Verify database and user exist

2. **Migration Errors**
   - Delete migration files if needed: `python manage.py migrate --fake-initial`
   - Reset migrations: `python manage.py migrate api zero`

3. **Data Loading Issues**
   - Check JSON file format
   - Ensure all required models exist
   - Verify foreign key relationships

### Performance Optimization

PostgreSQL offers several performance improvements over SQLite:

1. **Indexing**: Add database indexes for frequently queried fields
2. **Connection Pooling**: Consider using connection pooling for production
3. **Query Optimization**: Monitor slow queries and optimize them

## Production Deployment

For production deployment:

1. **Update Environment Variables**
   - Use strong passwords
   - Set `DEBUG=False`
   - Use environment-specific database settings

2. **Security Considerations**
   - Use SSL connections
   - Implement proper backup strategies
   - Set up monitoring and logging

3. **Performance Tuning**
   - Configure PostgreSQL for your workload
   - Set appropriate memory and connection limits
   - Monitor and optimize queries

## Rollback Plan

If you need to rollback to SQLite:

1. **Backup PostgreSQL Data**
   ```bash
   python manage.py dumpdata > postgresql_backup.json
   ```

2. **Switch Back to SQLite**
   - Set `USE_SQLITE=True` in `.env`
   - Run migrations: `python manage.py migrate`

3. **Restore Data**
   ```bash
   python manage.py loaddata postgresql_backup.json
   ```

## Support

If you encounter issues during migration:

1. Check the Django logs for error messages
2. Verify PostgreSQL logs for connection issues
3. Test database connectivity manually
4. Review the migration scripts for any issues

## Next Steps

After successful migration:

1. **Monitor Performance**: Track query performance and optimize as needed
2. **Backup Strategy**: Implement regular PostgreSQL backups
3. **Scaling**: Consider read replicas for high-traffic applications
4. **Maintenance**: Schedule regular database maintenance tasks 