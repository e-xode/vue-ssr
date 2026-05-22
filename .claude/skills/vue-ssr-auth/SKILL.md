---
name: vue-ssr-auth
description: "Authentication and security reference for the Vue SSR Starter Kit: email-based security code flow (signup → verify → dashboard), 6-digit code generation (crypto.randomInt), SHA-256 hashing, timingSafeEqual verification, bcryptjs password hashing, express-session with file-store, rate limiting per endpoint type, IP blocking, session destruction, reCAPTCHA v3 integration (client composable + server verification). Trigger on any auth work: login, signup, password reset, session management, security code, rate limiting, or captcha. Don't use for: general app architecture (→ vue-ssr-architecture), Docker/CI (→ vue-ssr-deployment), post-task validation (→ vue-ssr-hooks), UI/UX design (→ design agent)."
---

# Vue SSR Auth

> Owns the authentication flow, security patterns, session management, and access control.

## Auth flow: Signup → Verify → Dashboard

1. POST /api/auth/signup → creates user, generates 6-digit code (`crypto.randomInt`), hashes SHA-256
2. Email sent with code → user enters in VerifyCodeView
3. POST /api/auth/verify-code → `verifyCode()` uses `timingSafeEqual`, creates session
4. Redirect to `/:locale/dashboard`

## Security constants

| Constant | Value | Purpose |
| --- | --- | --- |
| SECURITY_CODE_EXPIRY_MS | 600000 | 10 minutes code validity |
| SECURITY_CODE_MAX_ATTEMPTS | 3 | Max verification attempts |
| RESEND_COOLDOWN_MS | 30000 | 30s between resends |
| BCRYPT_ROUNDS | 10 | Password hash cost |

## Security features

- Code generation: `crypto.randomInt` (not Math.random)
- Code hashing: SHA-256 hex (not base64)
- Code verification: `timingSafeEqual` (not string compare)
- Session destruction after password/email change
- Rate limiting per endpoint type
- COOKIE_SECRET validated in production
- IP blocking for brute-force prevention

## Session management

- `express-session` with `session-file-store`
- Sessions stored in `./sessions/` directory (persist across dev restarts)
- `req.session.userId` is a string — convert with `new ObjectId(str)`
- `destroyUserSessions(userId, excludeSessionId)` — deletes all except current

## Captcha integration

- **Server** (`shared/captcha.js`): Verifies reCAPTCHA v3 token via Google API
- **Client** (`composables/useCaptcha.js`): Loads script, exposes `execute(action)`
- Gracefully skipped if RECAPTCHA_SITE_KEY is not configured

## Middleware

- `requireAuth` — checks `req.session.userId` exists
- `requireAdmin` — checks user type via `isAdmin()`

## Where to look

| If you need… | Read |
| --- | --- |
| Full security flow details | [references/security-flow.md](./references/security-flow.md) |
