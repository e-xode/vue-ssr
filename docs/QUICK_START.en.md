# Quick Start

Get up and running in 5 minutes! 🚀

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB (local or Docker)

## Option 1: Without Docker (Simplest)

### 1. Clone and install

```bash
git clone https://github.com/yourusername/e-xode-vue-ssr.git
cd e-xode-vue-ssr
npm install
```

### 2. Configure environment

```bash
cp env_sample .env
```

Edit `.env` with your settings (or leave defaults for dev):

```env
NODE_PORT=5173
NODE_HOST=http://localhost:5173
MONGO_HOST=localhost:27017
MONGO_DB=app
MONGO_USER=root
MONGO_PWD=password
```

### 3. Start MongoDB

```bash
# With Homebrew (macOS)
brew services start mongodb-community

# Or with Docker
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest

# Or with Docker Compose
docker-compose up mongo
```

### 4. Start the app

```bash
npm run dev
```

✅ Application accessible at: **http://localhost:5173**

---

## Option 2: With Docker Compose (Recommended)

### 1. Docker Prerequisites

```bash
# Create Docker network
docker network create e-xode

# Verify Docker & Docker Compose
docker --version
docker-compose --version
```

### 2. Clone and configure

```bash
git clone https://github.com/yourusername/e-xode-vue-ssr.git
cd e-xode-vue-ssr
cp env_sample .env
```

### 3. Start services

```bash
docker-compose up -d
```

### 4. Verify everything works

```bash
# View logs
docker-compose logs -f node

# Check MongoDB
docker-compose logs mongo
```

✅ Application accessible at: **http://localhost:5173**

---

## Test Authentication

### 1. Go to signup page

Visit: http://localhost:5173/signup

### 2. Sign up

- Email: `test@example.com`
- Password: `TestPassword123!`
- Name: `Test User`

Click "Sign Up"

### 3. Configure email (OPTIONAL)

By default, emails are not sent. To enable them:

```env
MAILER_HOST=smtp.gmail.com
MAILER_PORT=587
MAILER_FROM=your-email@gmail.com
MAILER_LOGIN=your-email@gmail.com
MAILER_PASSWORD=app_specific_password
```

💡 **Note**: Gmail requires "App Specific Passwords" (not your regular password)

### 4. Verification (for dev without email)

1. Click "Resend Code" to see the code in logs
2. Or access MongoDB directly:

```bash
mongosh mongodb://root:password@localhost:27017/app

# In MongoDB shell:
db.auth('admin', 'password')
db.users.findOne({email: 'test@example.com'})
```

⚠️ You'll see the hashed code in `securityCode`
In server logs you'll see: `Email send error` (normal if not configured)

---

## Available npm Scripts

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build            # Compile for production
npm run build:client     # Compile client only
npm run build:server     # Compile server only

# Production
npm run prod             # Start production server
```

---

## Docker Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f node    # App logs
docker-compose logs -f mongo   # MongoDB logs

# Access container terminal
docker-compose exec node bash

# Restart a service
docker-compose restart node
```

---

## Explore the app

### Available pages

- **`/`** - Home
- **`/signup`** - Sign up
- **`/signin`** - Sign in
- **`/auth/verify-code`** - Verify code (after signup/signin)
- **`/dashboard`** - Dashboard (when authenticated)

### Code Explorer

```
src/
├── views/                # Pages
│   ├── Index/IndexView.vue
│   ├── Auth/SignupView.vue
│   ├── Auth/SigninView.vue
│   └── ...
├── components/           # Components
│   └── layout/TheHeader.vue
├── stores/               # State (Pinia)
│   └── auth.js
├── api/                  # API routes
│   └── auth/signup.js
└── translate/            # Translations
    └── en.json
```

---

## Common Issues

### ❌ "Port 5173 already in use"

```bash
# Kill the process
lsof -i :5173
kill -9 <PID>

# Or change the port
# Edit .env: NODE_PORT=5174
```

### ❌ "MongoDB connection refused"

```bash
# Check if MongoDB is running
docker ps | grep mongo

# Restart
docker-compose restart mongo

# Or start MongoDB
docker run -d -p 27017:27017 mongo:latest
```

### ❌ "Cannot GET /"

```bash
# Wait for server to fully start (can take 10-20s)
# Check logs
docker-compose logs node
```

### ❌ Hot reload not working

```bash
# This is Vite, it needs many watchers in Docker
# Solution: edit file and reload browser

# Or: increase limits
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## Next Steps

- 📖 Read [README.en.md](../README.en.md) for complete documentation
- 🏗️ Check [ARCHITECTURE.md](./ARCHITECTURE.md) for architecture details
- 🔌 Explore [API.md](./API.md) for endpoints
- 🚀 See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment

---

## Need Help?

```bash
# View all logs
docker-compose logs -f

# Stop and clean up
docker-compose down
docker-compose down -v  # Also remove volumes

# Rebuild images
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

Good luck! 🎉

---

**Made with ❤️**
