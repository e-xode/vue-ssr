# Vue 3 SSR Starter Kit

A complete and modern starter kit for building web applications with **Vue 3**, **Server-Side Rendering (SSR)**, authentication, and MongoDB.

🇫🇷 **[Version française](./README.fr.md)**

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [REST API](#-rest-api)
- [Authentication](#-authentication)
- [Internationalization (i18n)](#-internationalization-i18n)
- [Styling](#-styling)
- [Database](#-database)
- [Docker](#-docker)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Features

### Frontend
- ✅ **Vue 3** - Progressive JavaScript framework with Composition API
- ✅ **Server-Side Rendering (SSR)** - Server-side rendering for better SEO
- ✅ **Vite** - Ultra-fast bundler and dev server
- ✅ **Vue Router 5** - Client-side routing with SSR support
- ✅ **Pinia** - Robust state management
- ✅ **Vuetify 4** - Complete Material Design components
- ✅ **SCSS** - Global variables, mixins and themes
- ✅ **Vue i18n** - Multi-language support (EN, FR)

### Backend
- ✅ **Express.js** - Minimalist web framework
- ✅ **MongoDB** - Flexible NoSQL database
- ✅ **Secure Authentication** - Email/password with code verification
- ✅ **Sessions** - Secure session management
- ✅ **Nodemailer** - Integrated email sending
- ✅ **CORS & Validation** - Security configuration
- ✅ **Locale-Prefixed Routing** - SEO-friendly URLs with `/:locale(en|fr)/` prefix
- ✅ **Contact Page** - Contact form with API endpoint, validation, rate limiting
- ✅ **Helmet CSP** - Content Security Policy configured
- ✅ **Secure Code Verification** - SHA-256 hashing with timingSafeEqual

### Infrastructure
- ✅ **Docker & Docker Compose** - Complete containerization
- ✅ **GitHub Actions** - Automated CI/CD
- ✅ **Supervisor** - Process management in production

## 🏗️ Architecture

### General Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                       │
│                    Vue 3 + Vuetify UI                       │
└─────────────────────────────────────────────────────────────┘
                            ↕
                      (HTTP/REST API)
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Express Server (Node.js)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Entry Point: entry-server.js (SSR Renderer)       │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  API Routes: /api/auth, /api/...                   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Middleware: Session, CORS, Validation             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   MongoDB Database                          │
│            Collections: users, sessions, etc.               │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
e-xode.vue-ssr/
├── src/                          # Source code
│   ├── api/                      # REST API routes
│   │   ├── auth/                # Authentication endpoints
│   │   │   ├── me.js            # Get current user
│   │   │   ├── signup.js        # Sign up
│   │   │   ├── signin.js        # Sign in
│   │   │   ├── verify-code.js   # Verify security code
│   │   │   ├── resend-code.js   # Resend code
│   │   │   └── signout.js       # Sign out
│   │   ├── middleware.js        # Middleware (auth, validation)
│   │   └── router.js            # Routes registry
│   ├── components/              # Reusable Vue components
│   │   └── layout/              # Layout components
│   │       ├── TheHeader.vue    # Header
│   │       ├── TheFooter.vue    # Footer
│   │       └── index.js         # Components export
│   ├── stores/                  # Pinia stores
│   │   ├── auth.js              # Authentication store
│   │   └── index.js             # Stores export
│   ├── views/                   # Pages/Views
│   │   ├── Index/               # Home page
│   │   ├── Auth/                # Authentication pages
│   │   ├── Dashboard/           # Dashboard
│   │   └── NotFound/            # 404 page
│   ├── shared/                  # Shared utilities
│   │   ├── log.js               # Logger
│   │   ├── mongo.js             # MongoDB connection
│   │   └── email.js             # Email service
│   ├── plugins/                 # Vue plugins
│   │   └── vuetify.js           # Vuetify configuration
│   ├── styles/                  # Global styles
│   │   ├── variables.scss       # SCSS variables
│   │   └── mixins.scss          # SCSS mixins
│   ├── translate/               # i18n translations
│   │   ├── en.json              # English translations
│   │   ├── fr.json              # French translations
│   │   └── emails/              # Email templates
│   ├── App.vue                  # Root component
│   ├── App.scss                 # App.vue styles
│   ├── router.js                # Vue Router configuration
│   ├── main.js                  # App initialization
│   ├── entry-client.js          # Client entry point
│   ├── entry-server.js          # SSR entry point
│   ├── style.css                # Global CSS styles
│   └── json/                    # Static JSON data
├── docker/                      # Docker configuration
│   ├── build/                   # Production image
│   │   ├── Dockerfile          # Production Dockerfile
│   │   └── config/
│   │       └── supervisord.conf # Supervisor configuration
│   └── dev/                     # Development images
│       ├── node/                # Node.js dev container
│       │   ├── Dockerfile      # Dev Dockerfile
│       │   └── run.sh          # Dev startup script
│       └── mongo/               # MongoDB container
│           ├── Dockerfile      # MongoDB Dockerfile
│           └── init-scripts/    # DB initialization scripts
├── .github/                     # GitHub configuration
│   └── workflows/               # GitHub Actions
│       └── docker-build.yml     # Build and push Docker image
├── logs/                        # Logs and sessions
├── dist/                        # Production build (generated)
├── node_modules/                # npm dependencies (ignored)
├── package.json                 # Dependencies and npm scripts
├── vite.config.js               # Vite configuration
├── server.js                    # Main Express server
├── index.html                   # Main HTML template
├── docker-compose.yml           # Docker orchestration
├── env_sample                   # Example environment variables
├── .env                         # Environment variables (local)
├── .gitignore                   # Git ignored files
├── README.en.md                 # This file
├── README.fr.md                 # French documentation
└── docs/                        # Additional documentation
    ├── ARCHITECTURE.md          # Detailed architecture
    ├── API.md                   # API documentation
    ├── AUTHENTICATION.md        # Authentication flow
    ├── DEPLOYMENT.md            # Deployment guide
    └── TROUBLESHOOTING.md       # Troubleshooting
```

## 📋 Prerequisites

### Minimum Requirements
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **MongoDB** >= 5.0.0 (or access to an instance)

### Recommended for Docker
- **Docker** >= 20.0
- **Docker Compose** >= 1.29.0

## 📦 Installation

### Option 1: Local Development without Docker

1. **Clone the project**
```bash
git clone https://github.com/yourusername/e-xode-vue-ssr.git
cd e-xode-vue-ssr
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp env_sample .env
```

Edit `.env` with your settings:
```env
NODE_PORT=5173
NODE_HOST=http://localhost:5173

# MongoDB Database
MONGO_DB=app
MONGO_HOST=localhost:27017
MONGO_USER=user
MONGO_PWD=password
MONGO_TYPE=mongodb

# Email Server (Nodemailer)
MAILER_HOST=smtp.example.com
MAILER_PORT=587
MAILER_SSL=false
MAILER_FROM=noreply@example.com
MAILER_LOGIN=your@email.com
MAILER_PASSWORD=your_app_password

# Security
COOKIE_SECRET=your-secret-key
```

4. **Start MongoDB**
```bash
# On macOS with Homebrew
brew services start mongodb-community

# Or with Docker
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=user \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest
```

### Option 2: Development with Docker Compose

1. **Create Docker network (if doesn't exist)**
```bash
docker network create e-xode
```

2. **Clone and configure**
```bash
git clone https://github.com/yourusername/e-xode-vue-ssr.git
cd e-xode-vue-ssr
cp env_sample .env
```

3. **Start containers**
```bash
docker-compose up -d
```

Services will be available at:
- Application: http://localhost:5173
- MongoDB: localhost:27017

## ⚙️ Configuration

### Environment Variables

```env
# Execution mode
NODE_ENV=development|production

# Node.js Server
NODE_PORT=5173                    # Server port
NODE_HOST=http://localhost:5173   # Base server URL

# MongoDB
MONGO_TYPE=mongodb                # Connection type
MONGO_HOST=localhost:27017        # Host:Port MongoDB
MONGO_DB=app                      # Database name
MONGO_USER=user                   # MongoDB user
MONGO_PWD=password                # MongoDB password

# Nodemailer (Email)
MAILER_HOST=smtp.gmail.com        # SMTP server
MAILER_PORT=587                   # SMTP port
MAILER_SSL=false|true             # Use SSL/TLS
MAILER_FROM=app@example.com       # Source email
MAILER_LOGIN=user@gmail.com       # SMTP credential
MAILER_PASSWORD=app_password      # SMTP password

# Security
COOKIE_SECRET=change-me           # Secret for session cookies
```

### Vuetify Configuration

Edit [src/plugins/vuetify.js](src/plugins/vuetify.js) to customize:
- **Theme** (light/dark)
- **Colors** (primary, secondary, etc.)
- **Components** (defaults)

### Vite Configuration

Edit [vite.config.js](vite.config.js) for:
- Path aliases
- Build settings
- API proxy
- Environment variables

## 🚀 Quick Start

### Development

```bash
# Without Docker
npm run dev

# With Docker Compose
docker-compose up

# Application accessible at http://localhost:5173
```

### Build for Production

```bash
# Compile client and server
npm run build

# Optional download: compiled in dist/
# - dist/client/    → Client bundle
# - dist/server/    → Server bundle
```

### Production Execution

```bash
# Locally
npm run prod

# With Docker
docker-compose -f docker-compose.yml up
```

## 📁 Project Structure

### Entry Points

#### `src/entry-client.js`
Client entry point. Hydrates the Vue application rendered on the server.

#### `src/entry-server.js`
SSR entry point. Renders the application to HTML and generates meta tags.

#### `src/main.js`
Initializes the Vue application with:
- Vue Router
- Pinia (state management)
- Vue i18n (multi-language)
- Vuetify (components)

#### `server.js`
Main Express server that:
- Manages sessions
- Creates API routes
- Performs SSR rendering
- Serves static assets

### Request Flow

```
HTTP Request
    ↓
Express Middleware (session, CORS, JSON)
    ↓
API Router (/api/*)
    ↓
Security Middleware
    ↓
Handler (Database)
    ↓
JSON Response
    ↓
Client (Pinia store → Vue Component)
```

### SSR Rendering Flow

```
Page Request (e.g., /)
    ↓
entry-server.js
    ↓
Vue Router navigation
    ↓
Load page component
    ↓
renderToString() generates HTML
    ↓
Generate SEO meta tags
    ↓
Return complete HTML
    ↓
Browser receives + hydrates
```

## 🔌 REST API

### Authentication

#### `POST /api/auth/signup`
User registration

**Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "status": "verification_pending",
  "email": "user@example.com"
}
```

---

#### `POST /api/auth/signin`
User login

**Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response (200):**
```json
{
  "status": "verification_pending",
  "email": "user@example.com"
}
```

---

#### `POST /api/auth/verify-code`
Verify security code

**Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

#### `POST /api/auth/resend-code`
Resend security code

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "status": "code_sent",
  "email": "user@example.com"
}
```

---

#### `GET /api/auth/me`
Get current authenticated user

**Response (200):**
```json
{
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

#### `POST /api/auth/signout`
User logout

**Response (200):**
```json
{
  "status": "success"
}
```

### Error Handling

All errors return:

```json
{
  "error": "error.key.code"
}
```

Error codes are localized. See `src/translate/en.json` for all available codes.

## 🔐 Authentication

### Authentication Flow

```
1. User enters email/password
    ↓
2. Client POST /api/auth/signup or /api/auth/signin
    ↓
3. Server validates, hashes password (bcryptjs)
    ↓
4. Generate 6-digit code (10 min expiration)
    ↓
5. Send email with code
    ↓
6. User enters code
    ↓
7. Client POST /api/auth/verify-code
    ↓
8. Server validates code
    ↓
9. Create user session
    ↓
10. Return user profile
    ↓
11. Client stores in Pinia store
```

### Security

- ✅ Passwords hashed with bcryptjs (cost: 10)
- ✅ Security codes hashed in Base64
- ✅ Sessions stored (file storage dev, Redis in production)
- ✅ HTTP-only and Secure cookies in HTTPS
- ✅ Server-side input validation
- ✅ CORS configured
- ✅ CSRF protection (via cookies)

### Sessions

User sessions are stored in:
- **Development**: `logs/sessions/*.json`
- **Production**: To be configured (Redis recommended)

Configuration in `server.js`:
```javascript
const sessionMiddleware = session({
  store: new fileStore({ path: 'logs/sessions' }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,  // 7 days
    sameSite: 'lax',
    secure: isProduction,               // HTTPS only in production
    httpOnly: true,
    path: '/'
  },
  name: 'ssr.sid',
  resave: false,
  saveUninitialized: true,
  secret: process.env.COOKIE_SECRET
})
```

## 🌍 Internationalization (i18n)

### Supported Languages

- 🇬🇧 English (en)
- 🇫🇷 French (fr)

### Translation Files

- [src/translate/en.json](src/translate/en.json) - English strings
- [src/translate/fr.json](src/translate/fr.json) - French strings
- [src/translate/emails/en.js](src/translate/emails/en.js) - Email templates EN
- [src/translate/emails/fr.js](src/translate/emails/fr.js) - Email templates FR

### Usage

In Vue components:

```vue
<script setup>
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
</script>

<template>
  <div>
    <!-- Use a translation -->
    <h1>{{ t('app.name') }}</h1>

    <!-- Change language -->
    <button @click="locale = 'en'">English</button>
    <button @click="locale = 'fr'">Français</button>
  </div>
</template>
```

In JavaScript:

```javascript
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
console.log(t('nav.home'))
```

### Translation Structure

```json
{
  "app": {
    "name": "App",
    "byAuthor": "By Author"
  },
  "nav": {
    "home": "Home",
    "dashboard": "Dashboard"
  },
  "error": {
    "unauthorized": "Unauthorized",
    "auth": {
      "invalidCode": "Invalid code"
    }
  }
}
```

### Add a New Language

1. Create `src/translate/xx.json` (xx = language code)
2. Copy structure from `en.json`
3. Translate all values
4. Import in `src/main.js`:
```javascript
import xx from '@/translate/xx.json'

const i18n = createI18n({
  messages: { en, fr, xx }
})
```

## 🎨 Styling

### SCSS Architecture

```
src/styles/
├── variables.scss    # Spacing, border-radius, breakpoints
└── mixins.scss       # SCSS utilities
```

### Available Variables

```scss
// Spacing
$spacing-unit: 8px;
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// Border-radius
$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;
$border-radius-xl: 16px;

// Breakpoints
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
```

### Available Mixins

```scss
@include flex-center;              // Center with flexbox
@include flex-between;             // Space-between
@include flex-col;                 // Flex column
@include truncate;                 // Single line ellipsis
@include multiline-truncate(3);    // Multi-line ellipsis
@include absolute-center;          // Absolute Position centered
@include transition;               // Smooth transition
@include hover-lift;               // Lift effect on hover
@include respond-to('md') { };     // Media query
@include visually-hidden;          // Accessible hidden text
```

### Usage Example

```vue
<style lang="scss" scoped>
@import '@/styles/variables';
@import '@/styles/mixins';

.card {
  @include transition(transform, box-shadow);
  border-radius: $border-radius-lg;
  padding: $spacing-lg;

  &:hover {
    @include hover-lift;
  }

  @include respond-to('md') {
    padding: $spacing-xl;
  }
}
</style>
```

### Vuetify Theme

Customize colors in [src/plugins/vuetify.js](src/plugins/vuetify.js):

```javascript
const colors = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  accent: '#06b6d4',
  success: '#00c853',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  // ... more colors
}
```

## 🗄️ Database

### MongoDB

#### Configuration

```env
MONGO_TYPE=mongodb
MONGO_HOST=localhost:27017
MONGO_DB=app
MONGO_USER=user
MONGO_PWD=password
```

#### Collections

**users**
```javascript
{
  _id: ObjectId,
  email: string,              // Unique
  password: string,           // Hashed (bcryptjs)
  name: string,
  createdAt: Date,
  updatedAt: Date,
  securityCode: string,       // Hashed
  securityCodeExpires: Date,
  securityCodeAttempts: int   // Limit attempts
}
```

#### Connection

File [src/shared/mongo.js](src/shared/mongo.js) handles database connection:

```javascript
import { mongoConnect } from '#src/shared/mongo.js'

const { db, error } = await mongoConnect()
if (error) {
  console.error('DB Connection error:', error)
}

// Use the connection
const users = await db.collection('users').find({}).toArray()
```

#### Database Initialization

To load initial data, create a script in:
- `docker/dev/mongo/init-scripts/init-db.js`

Example:
```javascript
db.createCollection('users')
db.users.createIndex( { "email": 1 }, { unique: true } )
```

## 🐳 Docker

### Docker Compose Configuration

```yaml
services:
  node:
    # Node.js server with Vite dev server
    # Port: 5173
    # Volumes: Entire project (hot reload)

  mongo:
    # MongoDB dev
    # Port: 27017
    # Volumes: Data persistence
```

### Docker Images

#### Node.js Dev (`docker/dev/node/Dockerfile`)
- Base: `node:22-slim`
- Includes: Playwright dependencies
- Entry point: `npm run dev`

#### MongoDB Dev (`docker/dev/mongo/Dockerfile`)
- Base: Official MongoDB image
- Initializes database and users
- Custom scripts available

#### Production Image (`docker/build/Dockerfile`)
- Multi-stage build
- Base: `node:22-alpine` + `node:22-slim`
- Optimized for production
- Uses Supervisor

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f node
docker-compose logs -f mongo

# Access Node container bash
docker-compose exec node /bin/bash

# Access MongoDB CLI
docker-compose exec mongo mongosh
```

### Production Build

```bash
# Build the image
docker build -f docker/build/Dockerfile -t e-xode-vue-ssr:latest .

# Test locally
docker run -p 5173:5173 \
  -e NODE_ENV=production \
  -e NODE_PORT=5173 \
  e-xode-vue-ssr:latest
```

## 🚀 Deployment

### Preparation

- [ ] Define production environment variables
- [ ] Configure MongoDB in production
- [ ] Set up email service
- [ ] Generate secure `COOKIE_SECRET`
- [ ] Enable HTTPS (cookies secure: true)
- [ ] Configure MongoDB backup
- [ ] Set up monitoring/logging

### Deployment via Docker

#### 1. Push image to registry

```bash
# GitHub Container Registry
docker build -f docker/build/Dockerfile \
  -t ghcr.io/yourusername/e-xode-vue-ssr:latest .

docker push ghcr.io/yourusername/e-xode-vue-ssr:latest
```

#### 2. Deploy Server

```bash
# SSH to server
ssh user@prod-server.com

# Clone project
git clone https://github.com/yourusername/e-xode-vue-ssr.git
cd e-xode-vue-ssr

# Create production .env
nano .env

# Launch with Docker Compose
docker-compose up -d
```

### Production Environment Variables

```env
NODE_ENV=production
NODE_PORT=3006
NODE_HOST=https://yourdomain.com

MONGO_HOST=production-mongo:27017
MONGO_DB=app
MONGO_USER=produser
MONGO_PWD=strong_password_here

MAILER_HOST=smtp.sendgrid.net
MAILER_PORT=587
MAILER_FROM=noreply@yourdomain.com
MAILER_LOGIN=apikey
MAILER_PASSWORD=your_sendgrid_api_key

COOKIE_SECRET=generate_strong_random_value_here
```

### Reverse Proxy (Nginx)

```nginx
upstream app {
    server localhost:5173;
}

server {
    listen 80;
    server_name yourdomain.com;

    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    client_max_body_size 10M;

    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Monitoring

Integrate services like:
- **Datadog** - APM and monitoring
- **Sentry** - Error tracking
- **ELK Stack** - Centralized logging

### MongoDB Backup

```bash
# Automated backup (cron job)
0 2 * * * mongodump --uri="mongodb://user:pwd@host:27017/app" \
  --out="/backups/mongo/$(date +\%Y\%m\%d)" \
  --gzip --archive="/backups/mongo/app-$(date +\%Y\%m\%d).archive"
```

## 📚 Additional Guides

For more details, see:

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Detailed architecture
- [API.md](docs/API.md) - Complete API documentation
- [AUTHENTICATION.md](docs/AUTHENTICATION.md) - Authentication flow
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Complete deployment guide
- [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Troubleshooting

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server + Vite

# Build
npm run build             # Compile client and server
npm run build:client      # Compile client only
npm run build:server      # Compile server only

# Production
npm run prod              # Launch production server
```

### Add a New Page

1. Create component in `src/views/MyPage/MyPageView.vue`
2. Add route in `src/router.js`
3. Add translations in `src/translate/*.json`

### Add a New API Endpoint

1. Create file `src/api/myfeature/action.js`
2. Export function `setupMyFeatureRoute(app, db)`
3. Import and register in `src/api/router.js`

### Add a New Pinia Store

1. Create `src/stores/feature.js`
2. Export from `src/stores/index.js`
3. Use in components: `import { useFeatureStore } from '@/stores'`

## 🚨 Troubleshooting

### Email sending not working

**Check:**
```bash
# Environment variables
cat .env | grep MAILER

# Server logs
npm run dev
# Look for "Email send error"

# SMTP server access
# Example: Gmail requires "App passwords", not regular password
```

### MongoDB inaccessible

```bash
# Check logs
docker-compose logs mongo | grep "error"

# Restart MongoDB
docker-compose restart mongo

# Check availability
mongosh mongodb://localhost:27017/app -u user -p password
```

### Hot reload not working

```bash
# Increase watchers
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### "Address already in use" Error

```bash
# Find process using port
lsof -i :5173
kill -9 <PID>

# Or change port in .env
NODE_PORT=5174
```

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the project
2. Create a branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

This project is licensed under **MIT**. See [LICENSE](./LICENSE) for details.

## 📞 Support

For questions or issues:
- 📧 Email: support@example.com
- 🐛 Report bugs: [GitHub Issues](https://github.com/yourusername/e-xode-vue-ssr/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/e-xode-vue-ssr/discussions)

---

**Made with ❤️**
