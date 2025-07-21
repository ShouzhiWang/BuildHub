# BuildHub Deployment Guide

## 🔧 Development Setup (Current)

For local development with your existing database:

```bash
# Uses local PostgreSQL database
docker-compose up --build
```

**What this does:**
- ✅ Connects to your **local PostgreSQL** database
- ✅ Preserves all your existing data
- ✅ Hot reload for development
- ✅ Debug mode enabled

## 🚀 Production Deployment with Docker Compose (Aliyun Ready)

### 1. **Prepare Your Environment**
- Make sure you have Docker and Docker Compose installed on your Aliyun server.
- Open ports 80, 443 (for nginx), and 8000 (if you want direct backend access) in your Aliyun security group/firewall.

### 2. **Clone Your Repository**
```bash
# On your Aliyun server
git clone <your-repo-url>
cd BuildHub
```

### 3. **Set Up Environment Variables**
```bash
cp env.production.example .env
# Edit .env with your production values:
# - SECRET_KEY: Generate a secure secret key
# - ALLOWED_HOSTS: Your domain name(s) or server IP
# - DB_PASSWORD: Secure database password
# - REACT_APP_API_URL: Your production API URL (e.g., http://your-domain/api)
```

### 4. **Build and Start All Services**
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```
- This will build and start PostgreSQL, backend, frontend, and nginx.
- Nginx will serve the frontend and proxy API/media/static requests to the backend.

### 5. **Access Your Application**
- **Frontend**: http://<your-aliyun-public-ip>/
- **Backend API**: http://<your-aliyun-public-ip>/api/
- **Admin**: http://<your-aliyun-public-ip>/admin/

### 6. **Database Migration & Superuser**
```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
# Create admin user
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

### 7. **Static & Media Files**
- Static and media files are served by nginx from Docker volumes.
- You can back them up by mounting the volumes to your host or using `docker cp`.

### 8. **SSL (HTTPS) Setup**
- For production, set up SSL certificates (e.g., with Let's Encrypt and Certbot).
- You can mount your certs into the nginx container and update `nginx.conf` accordingly.
- Aliyun also provides load balancer and SSL options if you use their managed services.

### 9. **Aliyun Tips**
- Use Aliyun's security group to restrict access to only necessary ports.
- Use Aliyun OSS for large/static file storage if needed (update Django settings and nginx config).
- Monitor resource usage with `docker stats` and Aliyun console.

### 10. **Troubleshooting**
- Check logs: `docker-compose -f docker-compose.prod.yml logs <service>`
- Restart a service: `docker-compose -f docker-compose.prod.yml restart <service>`
- Check running containers: `docker ps`

---

## 🐳 Dockerfile & nginx.conf
- **Frontend production build**: `Dockerfile.prod` (builds React and serves with nginx)
- **nginx config**: `nginx.conf` (serves static, media, and proxies /api to backend)

---

## 📝 Example File Structure (Production)
```
BuildHub/
├── docker-compose.prod.yml
├── Dockerfile.prod
├── nginx.conf
├── .env
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── ...
└── ...
```

---

## ✅ You are ready to deploy on Aliyun!
- For custom domains, update DNS to point to your Aliyun instance.
- For scaling, consider Aliyun Container Service or Kubernetes.
- For persistent storage, use Aliyun cloud disks or OSS for media/static.

Happy deploying! 🚀

## 📁 **File Structure**

```
BuildHub/
├── docker-compose.yml           # Development (uses local PostgreSQL)
├── docker-compose.prod.yml      # Production (uses Docker PostgreSQL)
├── env.production.example       # Production environment template
└── DEPLOYMENT.md               # This guide
```

## 🌍 **Deployment Platforms**

### **Digital Ocean Droplet**
```bash
# On your server
git clone your-repo
cd BuildHub
cp env.production.example .env
# Edit .env with your values
docker-compose -f docker-compose.prod.yml up --build -d
```

### **AWS EC2 / Google Cloud**
```bash
# Same process as Digital Ocean
# Make sure ports 80, 443, 8000 are open in security groups
```

### **Docker Swarm / Kubernetes**
```bash
# Use docker-compose.prod.yml as base
# Convert to Kubernetes manifests or Docker Swarm stacks
```

## 🔄 **Switching Between Modes**

### **Development → Production**
1. Stop development containers: `docker-compose down`
2. Use production config: `docker-compose -f docker-compose.prod.yml up --build -d`

### **Production → Development**
1. Stop production containers: `docker-compose -f docker-compose.prod.yml down`
2. Use development config: `docker-compose up --build`

## 🛡️ **Security for Production**

1. **Environment Variables**: Never commit `.env` files with real credentials
2. **SECRET_KEY**: Generate a new, secure secret key for production
3. **Database Password**: Use strong, unique passwords
4. **HTTPS**: Set up SSL certificates (Let's Encrypt recommended)
5. **Firewall**: Only open necessary ports (80, 443)

## 📊 **Monitoring & Backups**

### **Database Backups**
```bash
# Automated backup script
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U buildhub_user buildhub > backup_$(date +%Y%m%d).sql
```

### **Logs**
```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
```

## 🎯 **Current Status**

- ✅ **Development**: Ready to use with local PostgreSQL
- ✅ **Production**: Configuration files created and ready
- 🔄 **Search Functionality**: Fully implemented and working
- 🔄 **Bookmark System**: Fully implemented and working

You can develop locally with your existing data, and when ready to deploy, simply use the production configuration! 