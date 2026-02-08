# Deployment Guide

Guide complet pour déployer e-xode-vue-ssr en production.

## 📋 Table des Matières

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Build Optimization](#build-optimization)
- [Docker Deployment](#docker-deployment)
- [Cloud Platforms](#cloud-platforms)
- [Monitoring & Logging](#monitoring--logging)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

### Security

- [ ] Tous les secrets sont dans `.env` (pas commitées dans git)
- [ ] `COOKIE_SECRET` est unique et changé depuis l'exemple
- [ ] `MAILER_PASSWORD` est l'app-specific password (pas le mot de passe account)
- [ ] `NODE_ENV=production` est défini
- [ ] HTTPS/SSL est configuré
- [ ] CORS allowlisted pour domaines spécifiques seulement

### Code Quality

- [ ] `npm run build` passe sans erreurs
- [ ] `npm run prod` fonctionne localement
- [ ] Pas de console.log de debug en production
- [ ] Imports/exports propres
- [ ] Pas de dépendances dev en production build

### Testing

- [ ] Signup flow testé end-to-end
- [ ] Signin flow testé
- [ ] Code verification testé
- [ ] Session persistence testé (refresh page)
- [ ] Logout testé
- [ ] Mobile responsiveness vérifié
- [ ] Erreurs 404/500 affichées correctement

### Database

- [ ] MongoDB connection string correcte
- [ ] Database user créé avec permissions minimales
- [ ] Indexes créés:
  ```bash
  db.users.createIndex({ email: 1 }, { unique: true })
  ```
- [ ] Backups configurés
- [ ] Monitoring activé

### Email

- [ ] MAILER_SERVICE correct (gmail, sendgrid, etc.)
- [ ] MAILER_EMAIL correct
- [ ] MAILER_PASSWORD correct (app password, pas account password)
- [ ] Test email envoyé avec succès
- [ ] Emails reçus pas marqués comme spam
- [ ] Sender name configuré (optionnel mais recommandé)

### DNS & Domain

- [ ] Domaine acheté ou transféré
- [ ] DNS pointant vers serveur correct
- [ ] A/AAAA records configurés
- [ ] MX records config (si self-hosted email)
- [ ] SSL certificate en attente

---

## 🔧 Environment Setup

### Environment Variables Template

Créer `.env.production`:

```bash
# Node
NODE_ENV=production
PORT=5173

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGO_DB_NAME=app
MONGO_USER=dbuser
MONGO_PASSWORD=dbpassword

# Email
MAILER_SERVICE=gmail
MAILER_EMAIL=noreply@your-domain.com
MAILER_PASSWORD=your_app_specific_password
MAILER_FROM=Your App <noreply@your-domain.com>

# Session
COOKIE_SECRET=generate_random_string_here_min_32_chars
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
SESSION_TIMEOUT=604800000  # 7 days in ms

# CORS
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com

# Optional: Sentry for error tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project

# Optional: Logging
LOG_LEVEL=info
LOG_FILE=/var/log/app/app.log
```

### Generate Secure Secrets

```bash
# Generate COOKIE_SECRET (32+ characters)
openssl rand -base64 32

# Example output:
# 5mJ8kL2xPoQ9nV3rT7wY+1aB4cD6eF9gH0iJ2kL3mN4o

# Use this in .env:
COOKIE_SECRET=5mJ8kL2xPoQ9nV3rT7wY+1aB4cD6eF9gH0iJ2kL3mN4o
```

---

## 🏗️ Build Optimization

### Verify Production Build

```bash
# 1. Build
npm run build

# 2. Check dist size
du -sh dist/
# Expected: 300KB - 500KB for client bundle

# 3. Analyze bundle (optional)
npm install --save-dev rollup-plugin-visualizer

# Update vite.config.js:
import { visualizer } from 'rollup-plugin-visualizer'
plugins: [visualizer()]

# Build again
npm run build

# Open stats.html in browser
```

### Pre-compression

```javascript
// vite.config.js
import compress from 'vite-plugin-compression'

export default {
  plugins: [
    compress({
      ext: '.gz',
      deleteOriginFile: false
    })
  ]
}
```

### Bundle Splitting

```javascript
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vue': ['vue', 'vue-router', 'pinia'],
        'vuetify': ['vuetify'],
        'vendor': ['axios', 'lodash']
      }
    }
  }
}
```

---

## 🐳 Docker Deployment

### Build Docker Image

```bash
# Build with Dockerfile
docker build -f docker/build/Dockerfile -t app:latest .

# Tag for registry
docker tag app:latest your-registry/app:latest
docker tag app:latest your-registry/app:1.0.0

# Push to registry
docker push your-registry/app:latest
```

### Deploy with Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  node:
    image: your-registry/app:latest
    container_name: app-prod
    restart: always
    environment:
      NODE_ENV: production
      MONGO_URI: ${MONGO_URI}
      COOKIE_SECRET: ${COOKIE_SECRET}
      # ... other env vars
    ports:
      - "5173:5173"
    volumes:
      - ./logs:/app/logs
      - ./public:/app/public  # For uploads if needed
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5173/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  mongo:
    image: mongo:latest
    container_name: app-mongo-prod
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/init.js
    networks:
      - app-network
    healthcheck:
      test: echo 'db.adminCommand("ping")' | mongosh -u ${MONGO_USER} -p ${MONGO_PASSWORD} --authenticationDatabase admin
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:latest
    container_name: app-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl  # SSL certificates
      - ./public:/app/public:ro
    depends_on:
      - node
    networks:
      - app-network

volumes:
  mongo-data:

networks:
  app-network:
    driver: bridge
```

### Deploy

```bash
# Load env vars
export $(cat .env.production | xargs)

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f node

# Stop services
docker-compose -f docker-compose.prod.yml down
```

---

## ☁️ Cloud Platforms

### Heroku

**1. Préparation**
```bash
# Create Procfile
echo "web: npm run prod" > Procfile

# Create app.json
cat > app.json << 'EOF'
{
  "name": "e-xode-vue-ssr",
  "description": "Vue 3 SSR Starter Kit",
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ],
  "env": {
    "NODE_ENV": {
      "value": "production"
    },
    "MONGO_URI": {
      "description": "MongoDB connection string"
    },
    "COOKIE_SECRET": {
      "description": "Secure session secret",
      "generator": "secret"
    }
  }
}
EOF
```

**2. Deploy**
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create my-app

# Set environment variables
heroku config:set NODE_ENV=production -a my-app
heroku config:set MONGO_URI=... -a my-app
heroku config:set COOKIE_SECRET=... -a my-app

# Deploy
git push heroku main

# View logs
heroku logs -f -a my-app

# Open app
heroku open -a my-app
```

### AWS EC2

**1. Setup Instance**
```bash
# Launch Ubuntu 22.04 LTS instance
# t2.micro (free tier) or t2.small

# Connect via SSH
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB (or use MongoDB Atlas)
sudo apt install -y mongodb-server

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Install git
sudo apt install -y git
```

**2. Deploy App**
```bash
# Clone repo
git clone https://github.com/your-repo/e-xode-vue-ssr.git
cd e-xode-vue-ssr

# Install dependencies
npm install --production

# Build
npm run build

# Copy env
cp env_sample .env.production
# Edit .env.production with production values

# Start with PM2
pm2 start server.js --name "app" --env production
pm2 save
pm2 startup

# Enable Nginx
sudo systemctl enable nginx

# Create Nginx config (see below)
```

**3. Nginx Configuration**
```nginx
# /etc/nginx/sites-available/app
upstream app {
  server 127.0.0.1:5173;
}

server {
  listen 80;
  server_name your-domain.com www.your-domain.com;

  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name your-domain.com www.your-domain.com;

  ssl_certificate /etc/ssl/certs/your-cert.crt;
  ssl_certificate_key /etc/ssl/private/your-key.key;

  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  client_max_body_size 10M;

  location / {
    proxy_pass http://app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
  }

  location /static/ {
    alias /app/dist/client/;
    expires 30d;
    add_header Cache-Control "public, immutable";
  }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/app
sudo nginx -t
sudo systemctl restart nginx
```

**4. SSL Certificate (Let's Encrypt)**
```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# Generate self-signed for testing:
sudo openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout /etc/ssl/private/your-key.key \
  -out /etc/ssl/certs/your-cert.crt
```

### DigitalOcean App Platform

**1. Deploy via GitHub**
- Push to GitHub
- Login to DigitalOcean
- App Platform → Create App
- Connect GitHub repo
- Select branch (main)
- Configure

**2. DigitalOcean CLI**
```bash
# Install
brew install doctl

# Authenticate
doctl auth init

# Deploy
doctl apps create --spec app.yaml
```

---

## 📊 Monitoring & Logging

### Logging Setup

```javascript
// src/shared/log.js - Already implemented

// Or enhance with Winston:
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

export default logger
```

### Error Tracking (Sentry)

```javascript
// server.js
import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
})

app.use(Sentry.Handlers.requestHandler())

// Routes here

app.use(Sentry.Handlers.errorHandler())
```

### Health Checks

```javascript
// server.js
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

// Docker healthcheck
// docker-compose.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5173/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Monitoring Tools

- **PM2 Monitoring**: `pm2 monitor`
- **New Relic**: APM monitoring
- **DataDog**: Infrastructure and app monitoring
- **CloudWatch**: AWS monitoring
- **uptimerobot.com**: Uptime monitoring

---

## ⚡ Performance Optimization

### CDN Setup

```nginx
# Nginx caching headers
location /dist/ {
  expires 30d;
  add_header Cache-Control "public, immutable";
  add_header Via "CloudFlare";
}
```

Use CloudFlare, AWS CloudFront, or similar for:
- Static assets caching
- Gzip compression
- DDoS protection

### Database Indexing

```bash
# Ensure indexes for common queries
mongosh mongodb://...

# User email lookup
> db.users.createIndex({ email: 1 })

# Session cleanup
> db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

# Verify indexes
> db.users.getIndexes()
```

### Connection Pooling

```javascript
// mongo.js
const client = new MongoClient(uri, {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 300000
})
```

### Caching Strategy

```javascript
// Add Redis caching (optional)
import redis from 'redis'

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
})

// Cache user lookup
app.get('/api/auth/me', async (req, res) => {
  const userId = req.session?.userId

  if (!userId) return res.json({ user: null })

  // Try cache
  const cached = await redisClient.get(`user:${userId}`)
  if (cached) return res.json({ user: JSON.parse(cached) })

  // Query DB
  const user = await db.collection('users').findOne({ _id: userId })

  // Cache for 5 minutes
  await redisClient.setEx(`user:${userId}`, 300, JSON.stringify(user))

  res.json({ user })
})
```

---

## 🐛 Troubleshooting

### App Crashes on Startup

```bash
# Check logs
npm run prod 2>&1 | tee prod.log

# Common issues:
# 1. MONGO_URI invalid
# 2. COOKIE_SECRET missing
# 3. PORT already in use
# 4. Missing dependencies
```

### Database Connection Issues

```bash
# Test connection
mongosh mongodb+srv://user:pass@cluster.mongodb.net/database

# Check connection string format is correct
# mongodb+srv://username:password@hostname/database
```

### SSL Certificate Issues

```bash
# Verify certificate
openssl x509 -in your-cert.crt -text -noout

# Check expiry
openssl x509 -enddate -noout -in your-cert.crt

# Test SSL
curl -v https://your-domain.com

# OpenSSL test
openssl s_client -connect your-domain.com:443
```

### Memory Leaks

```bash
# Monitor with PM2
pm2 monit

# Check Node process
ps aux | grep node
top

# Max memory in PM2
pm2 start server.js --max-memory-restart 256M
```

### High CPU Usage

```bash
# Profile with clinic.js
npm install -g clinic
clinic doctor -- npm run prod

# Or check which routes are slow
# Add timing logs to route handlers
console.time('route')
// ... route logic
console.timeEnd('route')
```

---

## 📚 Deployment Checklist Template

```markdown
## Pre-Launch

- [ ] All secrets in .env (not git)
- [ ] Build passes locally
- [ ] Tests pass
- [ ] No console errors
- [ ] Mobile responsive

## Post-Deploy

- [ ] App loads without errors
- [ ] Signup works end-to-end
- [ ] Signin works
- [ ] Email verified received
- [ ] Session persists
- [ ] Logout works
- [ ] Monitoring configured
- [ ] Backups automated
- [ ] SSL certificate valid
- [ ] DNS propagated

## Ongoing

- [ ] Daily log checks
- [ ] Weekly backups verified
- [ ] Monthly security audit
- [ ] Quarterly dependency updates
```

---

## 📚 Related Documentation

- [Quick Start Guide](./QUICK_START.en.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Architecture](./ARCHITECTURE.md)

---

**Questions? Open an issue or discussion on GitHub!**
