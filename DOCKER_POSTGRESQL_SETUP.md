# Docker PostgreSQL Setup for BuildHub

This guide explains how to run BuildHub with PostgreSQL using Docker.

## 🐳 Docker Configuration

### Updated Docker Compose

The `docker-compose.yml` has been updated to include PostgreSQL:

```yaml
services:
  # PostgreSQL Database
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=buildhub
      - POSTGRES_USER=buildhub_user
      - POSTGRES_PASSWORD=buildhub_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U buildhub_user -d buildhub"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Django Backend
  backend:
    build: ./backend
    command: sh -c "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"
    volumes:
      - ./backend:/app
      - backend_static:/app/staticfiles
      - backend_media:/app/media
    ports:
      - "8000:8000"
    environment:
      - DEBUG=True
      - USE_SQLITE=False
      - DB_NAME=buildhub
      - DB_USER=buildhub_user
      - DB_PASSWORD=buildhub_password
      - DB_HOST=postgres
      - DB_PORT=5432
      - SECRET_KEY=django-insecure-development-key-change-in-production
    depends_on:
      postgres:
        condition: service_healthy

  # React Frontend
  frontend:
    build: .
    ports:
      - "5173:5173"
    volumes:
      - ./src:/app/src
      - ./public:/app/public
      - ./package.json:/app/package.json
      - ./package-lock.json:/app/package-lock.json
      - ./vite.config.js:/app/vite.config.js
      - ./tailwind.config.js:/app/tailwind.config.js
      - ./postcss.config.js:/app/postcss.config.js
      - ./index.html:/app/index.html
      - frontend_node_modules:/app/node_modules
    environment:
      - NODE_ENV=development
    command: sh -c "rm -rf node_modules/.vite && npm ci && npm run dev"

volumes:
  frontend_node_modules:
  backend_static:
  backend_media:
  postgres_data:
```

## 🚀 Quick Start

### 1. Start All Services

```bash
docker-compose up --build
```

This will:
- Start PostgreSQL database
- Build and start Django backend
- Build and start React frontend
- Wait for PostgreSQL to be healthy before starting Django

### 2. Access Your Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **PostgreSQL**: localhost:5432

### 3. Stop Services

```bash
docker-compose down
```

## 🔧 Docker Commands

### Development

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build
```

### Database Operations

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U buildhub_user -d buildhub

# Run Django migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic
```

### Data Management

```bash
# Backup database
docker-compose exec postgres pg_dump -U buildhub_user buildhub > backup.sql

# Restore database
docker-compose exec -T postgres psql -U buildhub_user buildhub < backup.sql

# Reset database (WARNING: This will delete all data)
docker-compose down -v
docker-compose up --build
```

## 📁 Volume Management

### PostgreSQL Data
- **Volume**: `postgres_data`
- **Location**: Docker managed volume
- **Persistence**: Data survives container restarts

### Media Files
- **Volume**: `backend_media`
- **Location**: Docker managed volume
- **Purpose**: User uploads, project images

### Static Files
- **Volume**: `backend_static`
- **Location**: Docker managed volume
- **Purpose**: Django static files

## 🔒 Environment Variables

### Backend Environment
```bash
DEBUG=True
USE_SQLITE=False
DB_NAME=buildhub
DB_USER=buildhub_user
DB_PASSWORD=buildhub_password
DB_HOST=postgres
DB_PORT=5432
SECRET_KEY=django-insecure-development-key-change-in-production
```

### PostgreSQL Environment
```bash
POSTGRES_DB=buildhub
POSTGRES_USER=buildhub_user
POSTGRES_PASSWORD=buildhub_password
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

#### 2. Migration Errors
```bash
# Reset database
docker-compose down -v
docker-compose up --build
```

#### 3. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Rebuild containers
docker-compose up --build
```

#### 4. Port Conflicts
```bash
# Check what's using the ports
lsof -i :8000
lsof -i :5432
lsof -i :5173

# Change ports in docker-compose.yml if needed
```

### Health Checks

The PostgreSQL service includes health checks:
- **Test**: `pg_isready -U buildhub_user -d buildhub`
- **Interval**: 10 seconds
- **Timeout**: 5 seconds
- **Retries**: 5 attempts

Django will wait for PostgreSQL to be healthy before starting.

## 📊 Monitoring

### View Resource Usage
```bash
docker stats
```

### View Container Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs postgres
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

## 🔄 Production Considerations

### Security
- Change default passwords
- Use environment files for secrets
- Enable SSL for database connections
- Set `DEBUG=False` in production

### Performance
- Use PostgreSQL connection pooling
- Configure proper memory limits
- Set up database backups
- Monitor resource usage

### Scaling
- Use multiple database replicas
- Implement load balancing
- Set up proper logging
- Configure monitoring

## 📚 Additional Resources

- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Django Docker Documentation](https://docs.djangoproject.com/en/4.2/topics/install/)
- [Docker Compose Documentation](https://docs.docker.com/compose/) 