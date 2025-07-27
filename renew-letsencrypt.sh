#!/bin/bash

# Let's Encrypt Certificate Renewal Script
# Run this script via cron job: 0 12 * * * /path/to/renew-letsencrypt.sh

DOMAIN="yourdomain.com"  # Change this to your domain
EMAIL="your-email@yourdomain.com"  # Change this to your email

echo "Checking for certificate renewal for $DOMAIN..."

# Create temporary docker-compose for renewal
cat > docker-compose.renew.yml << EOF
version: '3.8'

services:
  certbot:
    image: certbot/certbot
    volumes:
      - ./ssl:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    command: renew --webroot --webroot-path=/var/www/certbot --email $EMAIL --agree-tos --no-eff-email
    depends_on:
      - nginx-temp

  nginx-temp:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./certbot/www:/var/www/certbot
      - ./nginx-temp.conf:/etc/nginx/conf.d/default.conf
    command: "nginx -g 'daemon off;'"
EOF

# Create temporary nginx config
cat > nginx-temp.conf << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}
EOF

# Create certbot directories
mkdir -p certbot/www

# Start temporary nginx
docker-compose -f docker-compose.renew.yml up -d nginx-temp

# Renew certificates
docker-compose -f docker-compose.renew.yml run --rm certbot

# Check if renewal was successful
if [ $? -eq 0 ]; then
    echo "✅ Certificates renewed successfully!"
    
    # Reload nginx in production
    docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
    
    echo "Nginx reloaded with new certificates"
else
    echo "❌ Certificate renewal failed"
fi

# Cleanup
docker-compose -f docker-compose.renew.yml down
rm -rf certbot
rm nginx-temp.conf
rm docker-compose.renew.yml

echo "Renewal process completed" 