# API Reference

Documentation complète des tous les endpoints API de e-xode-vue-ssr.

## 📋 Table des Matières

- [Overview](#overview)
- [Authentication Endpoints](#authentication-endpoints)
- [Request/Response Format](#requestresponse-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [CORS Policy](#cors-policy)
- [Examples](#examples)

---

## 🎯 Overview

**Base URL:**
```
Development: http://localhost:5173
Production: https://your-domain.com
```

**API Base Path:**
```
/api/
```

**Protocol:**
- HTTP/HTTPS
- JSON request/response
- RESTful design

**Authentication:**
- Session-based (cookies)
- Include credentials in requests
- Automatic on signup/signin

---

## 🔐 Authentication Endpoints

### POST /api/auth/signup

Créer un nouveau compte utilisateur.

**Endpoint:**
```
POST /api/auth/signup
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Request Headers:**
```
Content-Type: application/json
```

**Query Parameters:**
None

**Response (201 Created):**
```json
{
  "message": "Signup successful. Check your email for verification code.",
  "pendingEmail": "user@example.com"
}
```

**Response (400 Bad Request - Invalid Input):**
```json
{
  "error": "error.validation.emailRequired"
}
```

```json
{
  "error": "error.validation.invalidEmail"
}
```

```json
{
  "error": "error.validation.passwordRequired"
}
```

```json
{
  "error": "error.validation.passwordTooShort"
}
```

```json
{
  "error": "error.validation.nameRequired"
}
```

**Response (400 Bad Request - Email Exists):**
```json
{
  "error": "error.validation.emailExists"
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "error.server"
}
```

**Validations:**
- Email: format valide, pas de doublons
- Password: minimum 8 caractères
- Name: requis, 1-100 caractères

**Side Effects:**
- Créer utilisateur dans DB
- Générer code 6 chiffres
- Envoyer email avec code
- Stocker code hashé avec expiry 5 min

**Flow:**
```
User fills form
    ↓
POST /api/auth/signup
    ↓
Validate input
    ↓
Check email not exists
    ↓
Hash password
    ↓
Create user in DB
    ↓
Generate code
    ↓
Send email
    ↓
Return 201
```

---

### POST /api/auth/signin

Se connecter avec email et mot de passe.

**Endpoint:**
```
POST /api/auth/signin
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Signin code sent to your email.",
  "pendingEmail": "user@example.com"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "error.validation.emailRequired"
}
```

```json
{
  "error": "error.auth.invalidCredentials"
}
```

**Response (404 Not Found):**
```json
{
  "error": "error.auth.userNotFound"
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "error.server"
}
```

**Validations:**
- Email: requis, format valide
- Password: requis
- User existe et verified

**Side Effects:**
- Générer nouveau code 6 chiffres
- Mettre à jour user.securityCode
- Mettre à jour user.securityCodeExpires
- Envoyer email avec code

---

### POST /api/auth/verify-code

Vérifier le code de sécurité et créer la session.

**Endpoint:**
```
POST /api/auth/verify-code
Content-Type: application/json
Cookie: connect.sid=...
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "verified": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:35:00Z"
  },
  "message": "Verification successful. Session created."
}
```

**Response (400 Bad Request - Invalid Code):**
```json
{
  "error": "error.auth.invalidCode"
}
```

**Response (400 Bad Request - Expired Code):**
```json
{
  "error": "error.auth.codeExpired"
}
```

**Response (404 Not Found):**
```json
{
  "error": "error.auth.userNotFound"
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "error.server"
}
```

**Validations:**
- Email: requis, user existe
- Code: requis, 6 chiffres
- Code pas expiré
- Code correcte

**Side Effects:**
- Vérifier code vs stored hash
- Créer session (req.session.userId = _id)
- Marquer user.verified = true
- Réinitialiser user.securityCode
- Set cookie connect.sid

**Rate Limited:**
- 5 tentatives par minute
- Les tentatives échouées comptent

---

### POST /api/auth/resend-code

Renvoyer le code de vérification.

**Endpoint:**
```
POST /api/auth/resend-code
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Verification code resent to your email.",
  "expiresIn": 300
}
```

**Response (400 Bad Request):**
```json
{
  "error": "error.validation.emailRequired"
}
```

**Response (404 Not Found):**
```json
{
  "error": "error.auth.userNotFound"
}
```

**Response (429 Too Many Requests):**
```json
{
  "error": "error.rateLimit.tooMany"
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "error.server"
}
```

**Validations:**
- Email: requis, user existe
- User not rate limited (max 3 par 15 min par défaut)

**Side Effects:**
- Générer nouveau code
- Mettre à jour securityCode & expiry
- Envoyer email
- Incrémenter resend counter

**Rate Limited:**
- 3 tentatives par 15 minutes (par email)

---

### GET /api/auth/me

Obtenir l'utilisateur actuellement connecté.

**Endpoint:**
```
GET /api/auth/me
Cookie: connect.sid=...
```

**Request Headers:**
```
Cookie: connect.sid=...session_id_here
```

**Query Parameters:**
None

**Response (200 OK - Authenticated):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "verified": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:35:00Z"
  }
}
```

**Response (200 OK - Not Authenticated):**
```json
{
  "user": null
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "error.server"
}
```

**Validations:**
- Optionnel: pas besoin d'être logué (retourne null)

**Side Effects:**
- Aucun

**Usage:**
- Appelé au démarrage de l'app pour initialiser auth state
- Appelé après rafraîchissement de page
- Tester l'authentification de la session

---

### POST /api/auth/signout

Déconnecter l'utilisateur actuellement connecté.

**Endpoint:**
```
POST /api/auth/signout
Cookie: connect.sid=...session_id_here
```

**Request Headers:**
```
Cookie: connect.sid=...session_id_here
```

**Request Body:**
```json
{}
```

**Response (200 OK):**
```json
{
  "message": "Signed out successfully."
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "error.server"
}
```

**Validations:**
- Optionnel: peut signout même sans session active

**Side Effects:**
- Détruire session (req.session.destroy())
- Supprimer cookie connect.sid
- Frontend doit réinitialiser auth store

---

## 📦 Request/Response Format

### Common Headers

**Request:**
```
Content-Type: application/json
Accept: application/json
Cookie: connect.sid=...
```

**Response:**
```
Content-Type: application/json; charset=utf-8
Set-Cookie: connect.sid=...; Path=/; HttpOnly; Secure; SameSite=Strict
```

### Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | GET /api/auth/me returned user |
| 201 | Created | POST /api/auth/signup successful |
| 400 | Bad Request | Invalid email format |
| 401 | Unauthorized | Missing session |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | User not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Database connection failed |

### Response Envelope

Successful response:
```json
{
  "data": { ... },
  "message": "Operation successful"
}
```

Or:
```json
{
  "user": { ... }
}
```

Error response:
```json
{
  "error": "error.key.specific"
}
```

### Pagination (Future)

For list endpoints (quand implémentés):
```json
{
  "items": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true
  }
}
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "error": "error.validation.emailRequired",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Codes

**Authentication Errors:**
- `error.auth.invalidCredentials` - Email/password wrong
- `error.auth.invalidCode` - Code 6 chiffres invalide
- `error.auth.codeExpired` - Code expiré (> 5 min)
- `error.auth.userNotFound` - Utilisateur n'existe pas

**Validation Errors:**
- `error.validation.emailRequired` - Email manquant
- `error.validation.invalidEmail` - Email format invalide
- `error.validation.emailExists` - Email déjà utilisé
- `error.validation.passwordRequired` - Mot de passe manquant
- `error.validation.passwordTooShort` - < 8 caractères
- `error.validation.nameRequired` - Name manquant

**Rate Limiting:**
- `error.rateLimit.tooMany` - Trop de requêtes

**Server:**
- `error.server` - Erreur serveur générique

### Frontend Error Handling

```javascript
async function signup(email, password, name) {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle error
      console.error('Error:', data.error)
      showErrorMessage(t(data.error))
      return { status: 'error', error: data.error }
    }

    // Success
    return { status: 'success', data }
  } catch (err) {
    console.error('Network error:', err)
    return { status: 'error', error: 'error.server' }
  }
}
```

---

## 🚦 Rate Limiting

### Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/auth/signup | 5 | 15 min |
| POST /api/auth/signin | 10 | 15 min |
| POST /api/auth/verify-code | 5 | 1 min |
| POST /api/auth/resend-code | 3 | 15 min |
| GET /api/auth/me | Unlimited | - |
| POST /api/auth/signout | Unlimited | - |

### Response When Limited

```
HTTP/1.1 429 Too Many Requests
Retry-After: 300

{
  "error": "error.rateLimit.tooMany",
  "retryAfter": 300
}
```

### Implementation

```javascript
// Rate limiting par IP/email
const limiters = {
  signup: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyGenerator: (req) => req.body.email
  })
}
```

---

## 🔗 CORS Policy

### Allowed Origins

**Development:**
```
http://localhost:5173
http://127.0.0.1:5173
```

**Production:**
```
https://your-domain.com
https://www.your-domain.com
```

### Allowed Methods

```
GET, POST, PUT, DELETE, PATCH, OPTIONS
```

### Allowed Headers

```
Content-Type
Accept
X-Requested-With
Authorization (future)
```

### Credentials

```
credentials: true  // Send/receive cookies
Access-Control-Allow-Credentials: true
```

### Implementation

```javascript
// server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}))
```

---

## 💡 Examples

### Using curl

**Signup:**
```bash
curl -X POST http://localhost:5173/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

**Signin:**
```bash
curl -X POST http://localhost:5173/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Verify Code:**
```bash
curl -X POST http://localhost:5173/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=your_session_id" \
  -d '{
    "email": "user@example.com",
    "code": "123456"
  }'
```

**Get Current User:**
```bash
curl -X GET http://localhost:5173/api/auth/me \
  -H "Cookie: connect.sid=your_session_id"
```

**Signout:**
```bash
curl -X POST http://localhost:5173/api/auth/signout \
  -H "Cookie: connect.sid=your_session_id"
```

### Using JavaScript Fetch

```javascript
// Signup
const signupResponse = await fetch('/api/auth/signup', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    name: 'John Doe'
  })
})

const signupData = await signupResponse.json()
console.log(signupData)

// Verify Code
const verifyResponse = await fetch('/api/auth/verify-code', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    code: '123456'
  })
})

const verifyData = await verifyResponse.json()
if (verifyResponse.ok) {
  console.log('Logged in as:', verifyData.user.name)
}
```

### Using Postman

1. **Create Environment Variables:**
   - `base_url`: http://localhost:5173
   - `session_id`: (will be filled from response)

2. **Signup Request:**
   - Method: POST
   - URL: `{{base_url}}/api/auth/signup`
   - Body (JSON):
     ```json
     {
       "email": "postman@test.com",
       "password": "PostmanTest123!",
       "name": "Postman User"
     }
     ```

3. **Verify Code Request:**
   - Method: POST
   - URL: `{{base_url}}/api/auth/verify-code`
   - Headers: Cookie: `connect.sid={{session_id}}`
   - Body (JSON):
     ```json
     {
       "email": "postman@test.com",
       "code": "123456"
     }
     ```
   - Tests (save session):
     ```javascript
     const cookies = pm.cookies.jar().cookies;
     const sessionCookie = cookies.find(c => c.name === 'connect.sid');
     if (sessionCookie) {
       pm.environment.set('session_id', sessionCookie.value);
     }
     ```

---

## 🔒 Security Notes

1. **HTTPS Only**: En production, utiliser HTTPS
2. **Credentials**: `credentials: include` sur tous les requests
3. **CSRF**: SameSite=Strict sur cookies
4. **Password**: Ne jamais logger les passwords
5. **Codes**: Hashés en DB, jamais stocker en plaintext

---

## 📚 Related Documentation

- [Authentication Guide](./AUTHENTICATION.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

---

**Besoin d'assistance? Créer une issue sur GitHub!**
