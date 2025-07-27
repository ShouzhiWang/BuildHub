#!/bin/bash

# Let's Encrypt Setup Script
# Usage: ./setup-letsencrypt.sh yourdomain.com

DOMAIN=$1
EMAIL="your-email@yourdomain.com"  # Change this to your email

if [ -z "$DOMAIN" ]; then
    echo "Usage: ./setup-letsencrypt.sh yourdomain.com"
    exit 1
fi

echo "Setting up Let's Encrypt SSL for domain: $DOMAIN"

# Create directories
mkdir -p ssl
mkdir -p certbot/conf
mkdir -p certbot/www

# Create docker-compose for certbot
cat > docker-compose.certbot.yml << EOF
version: '3.8'

services:
  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    command: certonly --webroot --webroot-path=/var/www/certbot --email $EMAIL --agree-tos --no-eff-email -d $DOMAIN -d www.$DOMAIN
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

# Create temporary nginx config for certbot
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

echo "Starting temporary nginx for certificate validation..."
docker-compose -f docker-compose.certbot.yml up -d nginx-temp

echo "Requesting SSL certificate from Let's Encrypt..."
docker-compose -f docker-compose.certbot.yml run --rm certbot

echo "Stopping temporary nginx..."
docker-compose -f docker-compose.certbot.yml down

echo "Copying certificates..."
cp -r certbot/conf/live/$DOMAIN/* ssl/

echo "Setting proper permissions..."
chmod 600 ssl/privkey.pem
chmod 644 ssl/fullchain.pem

echo "Cleaning up..."
rm -rf certbot
rm nginx-temp.conf
rm docker-compose.certbot.yml

echo "✅ Let's Encrypt SSL certificates generated successfully!"
echo "Certificate files:"
echo "  - ssl/fullchain.pem (certificate)"
echo "  - ssl/privkey.pem (private key)"
echo ""
echo "Next steps:"
echo "1. Update nginx.conf to use the new certificates"
echo "2. Restart your production containers"
echo "3. Set up automatic renewal (see renewal script below)" 