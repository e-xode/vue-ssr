# Authentication Guide

Guide complet du système d'authentification de e-xode-vue-ssr.

## 📋 Table des Matières

- [Overview](#overview)
- [Flux d'Authentification](#flux-dauthentification)
- [Architecture](#architecture)
- [Security](#security)
- [API Reference](#api-reference)
- [Frontend Integration](#frontend-integration)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Le système d'authentification utilise une approche **email + code de sécurité**:

1. **Signup/Signin:** Utilisateur fournit email et mot de passe
2. **Code Generation:** Serveur génère un code 6 chiffres
3. **Email Delivery:** Code envoyé par email à l'utilisateur
4. **Verification:** Utilisateur rentre le code
5. **Session Creation:** Session créée après vérification
6. **Protected Routes:** Routes protégées vérifiées par session

**Avantages:**
- ✅ Sans 2FA supplémentaire
- ✅ Protection contre brute force
- ✅ Audit trail via emails
- ✅ Compatible avec tous les clients
- ✅ Recovery option intégrée

---

## 🔄 Flux d'Authentification

### Signup Flow

```
┌─────────────────────────────────────────────────────┐
│ 1. USER FILLS SIGNUP FORM                           │
│    - Email: user@example.com                        │
│    - Password: SecurePass123!                       │
│    - Name: John Doe                                 │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 2. POST /api/auth/signup                            │
│    - Validate email/password/name                   │
│    - Hash password with bcrypt (salt: 10)           │
│    - Generate 6-digit code (123456)                 │
│    - Hash code with Base64                          │
│    - Save to DB:                                    │
│      {                                              │
│        email: 'user@example.com',                   │
│        passwordHash: '$2b$10$...',                  │
│        name: 'John Doe',                            │
│        securityCode: 'base64_hash',                 │
│        securityCodeExpires: Date + 5min,            │
│        verified: false,                             │
│        createdAt: now                               │
│      }                                              │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 3. EMAIL SENT TO USER                               │
│    Subject: "Votre code de vérification"            │
│    Body: "Votre code: 123456"                       │
│           "Valide pendant 5 minutes"                │
│           "N'a été demandé par quelqu'un             │
│            d'autre, ignorez ce message"             │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 4. USER RECEIVES EMAIL & INPUT CODE                 │
│    Enter: 123456                                    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 5. POST /api/auth/verify-code                       │
│    - Get user by email                              │
│    - Check code not expired                         │
│    - Compare submitted code with stored hash        │
│    - If valid:                                      │
│      • req.session.userId = user._id                │
│      • Mark user verified: true                     │
│      • Return user data                             │
│      • Redirect to dashboard                        │
│    - If invalid:                                    │
│      • Return error: "invalid code"                 │
│      • User can resend code                         │
└─────────────────────────────────────────────────────┘
```

### Signin Flow

```
┌─────────────────────────────────────────────────────┐
│ 1. USER FILLS SIGNIN FORM                           │
│    - Email: user@example.com                        │
│    - Password: SecurePass123!                       │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 2. POST /api/auth/signin                            │
│    - Find user by email                             │
│    - Compare password with bcrypt hash              │
│    - If no user or password wrong: error            │
│    - Generate 6-digit code                          │
│    - Update DB with new code & expiry               │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 3. EMAIL SENT (same as signup step 3)               │
│    Subject: "Code de connexion: 123456"             │
│    "Valide pendant 5 minutes"                       │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 4. VERIFY CODE (same as signup step 5)              │
└─────────────────────────────────────────────────────┘
```

### Authentication State

```javascript
// Frontend Pinia Store (stores/auth.js)
{
  user: null,              // Current user object
  pendingEmail: null,      // Email waiting for code
  verificationContext: null, // 'signup' | 'signin' | 'recover'
  loading: false,
  error: null
}

// Computed
isAuthenticated: user !== null

// Actions
signup(email, password, name)
signin(email, password)
verifyCode(code)
resendCode()
fetchCurrentUser()
signout()
```

---

## 🏗️ Architecture

### Directory Structure

```
src/api/auth/
├── signup.js              # POST /api/auth/signup
├── signin.js              # POST /api/auth/signin
├── verify-code.js         # POST /api/auth/verify-code
├── resend-code.js         # POST /api/auth/resend-code
├── me.js                  # GET /api/auth/me
└── signout.js             # POST /api/auth/signout

src/stores/
└── auth.js                # Pinia store

src/views/Auth/
├── SignupView.vue         # Signup form
├── SigninView.vue         # Signin form
└── VerifyCodeView.vue     # Code verification

src/shared/
├── email.js               # Email/code generation
└── mongo.js               # Database connection
```

### Database Schema

**users collection:**

```javascript
{
  _id: ObjectId,
  email: "user@example.com",        // Unique index
  passwordHash: "$2b$10$...",       // bcrypt hash
  name: "John Doe",
  verified: true,                   // Verified user
  securityCode: "base64_hash",      // Temporary
  securityCodeExpires: Date,        // Temporary
  createdAt: Date,
  updatedAt: Date,
  lastSigninAt: Date,               // Optional tracking
  failedAttempts: 0,                // Optional rate limiting
  lockedUntil: null                 // Optional lockout
}
```

### Middleware Stack

```
Express Request
    ↓
┌─────────────────────────────────┐
│ 1. Session Middleware           │ ← Loads req.session
│    express-session              │   & req.session.userId
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 2. CORS Middleware              │ ← Allows credentials
│    credentials: include         │   from cross-origin
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 3. Body Parser                  │ ← Parses JSON
│    application/json             │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 4. Auth Routes                  │ ← /api/auth/*
│    (optional protection)        │
└─────────────────────────────────┘
    ↓
Response
```

### Session Management

```javascript
// server.js
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',  // HTTPS only
    httpOnly: true,                                  // No JS access
    sameSite: 'strict',                              // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000                 // 7 days
  }
}))

// Usage:
app.post('/api/auth/verify-code', async (req, res) => {
  // ... verification logic
  req.session.userId = user._id  // Create session
  res.json({ user })
})

// Getting session:
const userId = req.session?.userId
const isAuthenticated = !!userId
```

---

## 🔐 Security

### Password Security

**Bcrypt Hashing:**
```javascript
import bcryptjs from 'bcryptjs'

// Signup: hash password
const salt = 10  // Cost factor
const passwordHash = await bcryptjs.hash(password, salt)

// Signin: compare
const isValid = await bcryptjs.compare(inputPassword, passwordHash)
```

**Why bcryptjs:**
- ✅ Salted hashing (prevents rainbow tables)
- ✅ Adaptive cost (slow = brute force protection)
- ✅ No plaintext storage
- ✅ Industry standard

### Code Security

**Generation:**
```javascript
// Generate 6-digit random code
const code = Math.floor(100000 + Math.random() * 900000).toString()
// Example: "548293"

// Hash for storage
const hashedCode = Buffer.from(code).toString('base64')

// Store in DB with expiry
user.securityCode = hashedCode
user.securityCodeExpires = new Date(Date.now() + 5 * 60 * 1000)

// Email actual code (readable, not hash)
await sendEmail({
  to: email,
  text: `Your code: ${code}`
})
```

**Why hash the code:**
- ✅ DB compromise doesn't leak codes
- ✅ Prevents code reuse if DB accessed
- ✅ Codes still human-readable in emails

### Session Security

```javascript
cookie: {
  secure: true,              // HTTPS only, prevents MITM
  httpOnly: true,            // No JavaScript access, prevents XSS
  sameSite: 'strict'         // CSRF protection
  // maxAge set per deployment
}
```

**Session Lifetime:**
- Development: 7 days
- Production: Consider 24-48 hours
- Requires re-auth for sensitive operations

### Rate Limiting (Optional)

```javascript
// src/shared/rateLimit.js
import rateLimit from 'express-rate-limit'

export const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 min
  max: 5,                       // 5 requests
  message: 'Too many signups, try again later'
})

export const verifyCodeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,      // 1 min
  max: 5,                       // 5 attempts
  message: 'Too many attempts, try again later'
})

// server.js
app.post('/api/auth/signup', signupLimiter, setupSignupRoute)
app.post('/api/auth/verify-code', verifyCodeLimiter, setupVerifyCodeRoute)
```

### Account Lockout (Optional)

```javascript
// Add to user schema
failedAttempts: 0,
lockedUntil: null

// In verify-code.js:
const THREE_FAILED_ATTEMPTS = 3
const LOCKOUT_DURATION = 15 * 60 * 1000  // 15 min

if (user.lockedUntil && user.lockedUntil > new Date()) {
  return res.status(429).json({
    error: 'Account temporarily locked. Try again later.'
  })
}

if (!codeValid) {
  user.failedAttempts = (user.failedAttempts || 0) + 1

  if (user.failedAttempts >= THREE_FAILED_ATTEMPTS) {
    user.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION)
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { failedAttempts: user.failedAttempts, lockedUntil: user.lockedUntil } }
    )
  }
}

// Reset on successful verify
if (codeValid) {
  await db.collection('users').updateOne(
    { _id: user._id },
    { $set: {
      failedAttempts: 0,
      lockedUntil: null,
      verified: true
    } }
  )
}
```

---

## 📡 API Reference

### POST /api/auth/signup

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "Signup successful. Check your email for verification code.",
  "pendingEmail": "user@example.com"
}
```

**Errors:**
- 400: Invalid input (missing field, invalid email format)
- 400: Email already exists
- 500: Server error (email sending failed, DB error)

### POST /api/auth/signin

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "message": "Signin code sent to your email.",
  "pendingEmail": "user@example.com"
}
```

**Errors:**
- 400: Invalid email or password
- 400: User not found

### POST /api/auth/verify-code

**Request:**
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
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "verified": true,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Verification successful. Session created."
}
```

**Errors:**
- 400: Invalid or expired code
- 404: User not found
- 500: Server error

### POST /api/auth/resend-code

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Verification code resent to your email.",
  "expiresIn": 300
}
```

**Errors:**
- 400: User not found
- 429: Too many resend attempts (rate limited)

### GET /api/auth/me

**Request:**
```
GET /api/auth/me
Cookie: connect.sid=...
```

**Response (200) - if authenticated:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "verified": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (200) - if not authenticated:**
```json
{
  "user": null
}
```

### POST /api/auth/signout

**Request:**
```
POST /api/auth/signout
Cookie: connect.sid=...
```

**Response (200):**
```json
{
  "message": "Signed out successfully."
}
```

---

## 🎨 Frontend Integration

### Auth Store Usage

**In a Composable:**
```javascript
// composables/useAuth.js
import { useAuthStore } from '@/stores/auth'
import { ref, computed } from 'vue'

export function useAuth() {
  const authStore = useAuthStore()

  return {
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    loading: computed(() => authStore.loading),
    error: computed(() => authStore.error),

    signup: (email, password, name) => authStore.signup(email, password, name),
    signin: (email, password) => authStore.signin(email, password),
    verifyCode: (code) => authStore.verifyCode(code),
    resendCode: () => authStore.resendCode(),
    signout: () => authStore.signout()
  }
}
```

**In a Component:**
```vue
<script setup>
import { useAuth } from '@/composables/useAuth'

const { user, isAuthenticated, loading, signup } = useAuth()

async function handleSignup(formData) {
  await signup(formData.email, formData.password, formData.name)
}
</script>

<template>
  <div v-if="!isAuthenticated">
    <p>Not signed in</p>
    <button @click="signup(...)">Sign Up</button>
  </div>
  <div v-else>
    <p>Welcome {{ user.name }}!</p>
  </div>
</template>
```

### Route Protection

```javascript
// router.js
import { useAuthStore } from '@/stores/auth'

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires auth
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/signin')
  } else if (to.meta.layout === 'app' && !authStore.isAuthenticated) {
    // Redirect non-auth users away from protectedroutes
    next('/')
  } else {
    next()
  }
})

// Route definition
{
  path: '/dashboard',
  component: () => import('@/views/Dashboard/DashboardView.vue'),
  meta: {
    layout: 'app',
    requiresAuth: true
  }
}
```

### Initialize Auth on App Load

```javascript
// main.js or entry-client.js
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const authStore = useAuthStore()

// Fetch current user on app init
await authStore.fetchCurrentUser()

app.mount('#app')
```

---

## 🔧 Customization

### Extend User Schema

```javascript
// src/api/auth/signup.js
const user = {
  email,
  passwordHash,
  name,
  verified: false,

  // Add custom fields:
  phone: null,
  avatar: null,
  bio: null,
  preferences: {
    language: 'en',
    newsletter: true
  },

  securityCode,
  securityCodeExpires,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

### Modify Code Expiry

```javascript
// src/shared/email.js
const CODE_EXPIRES_IN = 5 * 60 * 1000  // 5 minutes

// Change to 10 minutes:
const CODE_EXPIRES_IN = 10 * 60 * 1000
```

### Custom Email Template

```javascript
// src/translate/emails/en.js
export default {
  securityCode: {
    subject: () => 'Your Security Code',
    html: ({ code, email }) => `
      <h1>Verify Your Email</h1>
      <p>Hi,</p>
      <p>Your security code is: <strong>${code}</strong></p>
      <p>This code expires in 5 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
      <hr>
      <small>This is an automated message, please don't reply.</small>
    `
  }
}
```

### Add OAuth/Social Auth

```javascript
// src/api/auth/oauth-google.js
import { google } from 'googleapis'

export function setupOAuthGoogleRoute(app, db) {
  app.get('/api/auth/oauth/google', async (req, res) => {
    // Redirect to Google OAuth consent screen
    // Get auth code → exchange for token → get user info
    // Create/update user in DB
    // Create session
  })
}
```

### Two-Factor Authentication

```javascript
// src/api/auth/setup-2fa.js
import QRCode from 'qrcode'
import speakeasy from 'speakeasy'

export function setupTwoFactorRoute(app, db) {
  app.post('/api/auth/setup-2fa', async (req, res) => {
    const secret = speakeasy.generateSecret()
    const qrCode = await QRCode.toDataURL(secret.otpauth_url)

    res.json({
      secret: secret.base32,
      qrCode  // URL to show user
    })
  })
}
```

---

## 🐛 Troubleshooting

### "Invalid code" error

**Causes:**
1. Code expired (> 5 minutes)
2. Code doesn't match
3. DB record deleted

**Solution:**
```bash
# Check DB:
mongosh mongodb://root:password@localhost:27017/app
> db.users.findOne({email: 'test@example.com'})
> // Check securityCodeExpires is in future
```

### "Email not received"

See [Troubleshooting Guide - Email Section](./TROUBLESHOOTING.md#email)

### Session expires immediately

Check [Troubleshooting Guide - Session Section](./TROUBLESHOOTING.md#session-expire-trop-vite--pas-du-tout)

### User lockout (too many attempts)

```javascript
// Reset lockout manually:
mongosh mongodb://root:password@localhost:27017/app
> db.users.updateOne(
    { email: 'user@example.com' },
    { $set: { failedAttempts: 0, lockedUntil: null } }
  )
```

---

## 📚 Related Docs

- [API Reference](./API.md)
- [Quick Start Guide](./QUICK_START.en.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)

---

**Questions? Create an issue or open a discussion!**
