# Security flow details

## Code generation and verification

```
generateSecurityCode() → { code, hash }
  - code: crypto.randomInt(100000, 999999).toString()
  - hash: SHA-256 hex of code

verifyCode(input, hash) → boolean
  - Compares SHA-256(input) with stored hash using timingSafeEqual
  - Prevents timing attacks
```

## Password handling

- Hashing: `bcryptjs` with BCRYPT_ROUNDS (10)
- Comparison: `bcrypt.compare(input, hash)` — constant-time internally
- On password change: all sessions destroyed except current

## Rate limiting (disabled in dev)

| Limiter        | Limit   | Window | Endpoints                     |
| -------------- | ------- | ------ | ----------------------------- |
| authLimiter    | 10 req  | 15 min | signup, signin, verify, reset |
| accountLimiter | 20 req  | 15 min | profile, password, email      |
| contactLimiter | 3 req   | 15 min | POST /api/contact             |
| apiLimiter     | 100 req | 15 min | admin endpoints               |

## IP security

- `getClientIp(req)` — extracts real IP from proxy headers
- `isIpBlocked(db, ip)` — checks blocklist collection
- `recordLoginIp(db, userId, ip)` — audit trail

## Auth endpoints

| Method | Path                      | Auth | Purpose                    |
| ------ | ------------------------- | ---- | -------------------------- |
| POST   | /api/auth/signup          | No   | Create account + send code |
| POST   | /api/auth/signin          | No   | Login + send code          |
| POST   | /api/auth/verify-code     | No   | Verify 6-digit code        |
| POST   | /api/auth/resend-code     | No   | Resend verification code   |
| POST   | /api/auth/forgot-password | No   | Send reset email           |
| POST   | /api/auth/reset-password  | No   | Set new password           |
| POST   | /api/auth/signout         | Yes  | Destroy session            |
| GET    | /api/auth/me              | Yes  | Get current user           |
| PUT    | /api/auth/profile         | Yes  | Update profile             |
| POST   | /api/auth/avatar          | Yes  | Upload avatar              |
| POST   | /api/auth/change-password | Yes  | Change password            |
| POST   | /api/auth/change-email    | Yes  | Change email               |
