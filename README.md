# BuildHub

A platform for sharing and discovering DIY projects, built with Django and React.

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd BuildHub

# Start all services with PostgreSQL
docker-compose up --build
```

Access your application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000

### Option 2: Local Development

#### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 15+

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up PostgreSQL database
./setup_postgresql.sh

# Configure environment
cp env.example .env
# Edit .env to set USE_SQLITE=False

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

#### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🗄️ Database

BuildHub uses **PostgreSQL** as its primary database:

- **Database**: `buildhub`
- **User**: `buildhub_user`
- **Password**: `buildhub_password`
- **Host**: `localhost` (local) / `postgres` (Docker)
- **Port**: `5432`

### Migration from SQLite

If you're migrating from SQLite to PostgreSQL:

```bash
cd backend
python complete_sql_migration.py
```

See `POSTGRESQL_MIGRATION_GUIDE.md` for detailed migration instructions.

## 🐳 Docker Configuration

The application includes a complete Docker setup with:

- **PostgreSQL Database**: Persistent data storage
- **Django Backend**: API and admin interface
- **React Frontend**: User interface

### Docker Services

```yaml
services:
  postgres:     # PostgreSQL database
  backend:      # Django API
  frontend:     # React frontend
```

### Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Reset database
docker-compose down -v
docker-compose up --build
```

See `DOCKER_POSTGRESQL_SETUP.md` for detailed Docker documentation.

## 📁 Project Structure

```
BuildHub/
├── backend/                    # Django backend
│   ├── api/                   # Django app
│   ├── buildhub_backend/      # Django settings
│   ├── complete_sql_migration.py  # Migration script
│   ├── check_database_content.py  # Verification script
│   ├── setup_postgresql.sh    # Database setup
│   └── requirements.txt       # Python dependencies
├── src/                       # React frontend
├── docker-compose.yml         # Docker configuration
├── Dockerfile                 # Frontend Dockerfile
└── README.md                  # This file
```

## 🔧 Development

### Backend Development

```bash
cd backend

# Run tests
python manage.py test

# Create superuser
python manage.py createsuperuser

# Check database content
python check_database_content.py

# Run migrations
python manage.py migrate
```

### Frontend Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 📊 Features

- **User Management**: Registration, authentication, profiles
- **Project Sharing**: Create and share DIY projects
- **Categories**: Organize projects by type
- **Comments**: Discuss projects with other users
- **File Attachments**: Upload project files and images
- **Team Collaboration**: Add team members to projects
- **Bill of Materials**: Track project components
- **Search**: Find projects by keywords and categories

## 🛠️ Technology Stack

### Backend
- **Django 4.2**: Web framework
- **Django REST Framework**: API development
- **PostgreSQL**: Database
- **Django CORS Headers**: Cross-origin requests
- **Pillow**: Image processing

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Axios**: HTTP client

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **PostgreSQL**: Database server

## 📚 Documentation

- `POSTGRESQL_MIGRATION_GUIDE.md`: Complete migration guide
- `DOCKER_POSTGRESQL_SETUP.md`: Docker setup guide
- `backend/README_POSTGRESQL_MIGRATION.md`: Quick migration start
- `backend/MIGRATION_CLEANUP.md`: Migration files cleanup

## 🔒 Environment Variables

### Backend (.env)
```bash
DEBUG=True
USE_SQLITE=False
DB_NAME=buildhub
DB_USER=buildhub_user
DB_PASSWORD=buildhub_password
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-secret-key
```

### Docker Environment
Environment variables are configured in `docker-compose.yml` for containerized deployment.

## 🚀 Deployment

### Production Considerations

1. **Security**:
   - Change default passwords
   - Use environment files for secrets
   - Enable SSL
   - Set `DEBUG=False`

2. **Performance**:
   - Configure PostgreSQL connection pooling
   - Set up database backups
   - Monitor resource usage

3. **Scaling**:
   - Use multiple database replicas
   - Implement load balancing
   - Set up proper logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with details

---

**BuildHub** - Share your DIY projects with the world! 🛠️ 