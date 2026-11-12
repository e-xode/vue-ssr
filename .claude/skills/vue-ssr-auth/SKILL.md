---
name: vue-ssr-auth
description: "Authentication and security reference for the Vue SSR Starter Kit: the email-based security code flow, session management, IP blocking, and reCAPTCHA v3 integration. Trigger on any auth work: login, signup, password reset, session management, security code, or captcha. Don't use for: rate limiter definitions/values (→ vue-ssr-server), general app architecture (→ vue-ssr-architecture), Docker/CI (→ vue-ssr-deployment), post-task validation (→ vue-ssr-validation), UI/UX design (→ design agent)."
---

# Vue SSR Auth

> Owns the authentication flow, security patterns, session management, and access control.

## Division of responsibilities (vue-ssr-auth ↔ vue-ssr-server)

| Concern                                                                | Owner            |
| ------------------------------------------------------------------------ | ------------------ |
| Express route mechanics, middleware guards, rate limiters, MongoDB queries/indexes | `vue-ssr-server`   |
| Which endpoints need auth protection, and the auth-domain logic itself   | `vue-ssr-auth`     |
| File structure, SSR lifecycle, locale routing, new view/feature scaffolding | vue-ssr-architecture |
| Build/bundle/production deployment config                                   | vue-ssr-deployment   |
| post-task validation                                                        | vue-ssr-validation   |

The two facts drifted apart once before (a stale limiter table here disagreed with the router) —
see `vue-ssr-server`'s "Rate limiting" section for the current names and values; don't duplicate them
here.

## Auth flow: Signup → Verify → Dashboard

1. POST /api/auth/signup → creates user, generates 6-digit code (`crypto.randomInt`), hashes SHA-256
2. Email sent with code → user enters in VerifyCodeView
3. POST /api/auth/verify-code → `verifyCode()` uses `timingSafeEqual`, then `startUserSession()` (new session id, `createdAt` stamped)
4. Redirect to `/:locale/dashboard`

## Security constants

| Constant                   | Value  | Purpose                   |
| -------------------------- | ------ | ------------------------- |
| SECURITY_CODE_EXPIRY_MS    | 600000 | 10 minutes code validity  |
| SECURITY_CODE_MAX_ATTEMPTS | 3      | Max verification attempts |
| RESEND_COOLDOWN_MS         | 30000  | 30s between resends       |
| BCRYPT_ROUNDS              | 10     | Password hash cost        |

## Security features

- Code generation: `crypto.randomInt` (not Math.random)
- Code hashing: SHA-256 hex (not base64)
- Code verification: `timingSafeEqual` (not string compare), always through `checkSubmittedCode(db, user, { code, storedHash, attemptsField })` (`src/shared/security.js`): lockout check, atomic attempt claim (`claimCodeAttempt`, conditional `$inc`), comparison, failure recording
- Attempts: 3 per code; account lockout after `CODE_LOCKOUT_MAX_FAILURES` (10) wrong codes within `CODE_LOCKOUT_WINDOW_MS` (1 h), across re-issued codes (`codeFailures`, `codeFailuresSince`)
- Code purpose: codes are created with `createSecurityCode(purpose)` (`SECURITY_CODE_PURPOSES.LOGIN` / `RESET_PASSWORD`, stored in `securityCodePurpose`); `verify-code` accepts only login codes, `reset-password` only reset codes (`hasPendingCode(user, purpose)`); `resend-code` keeps the pending purpose
- User data in responses: allowlist `USER_SAFE_PROJECTION` (admin: `ADMIN_USER_PROJECTION`); a new user field is private until listed there
- Enumeration: `verify-code` answers 401 `error.auth.invalidCode` for an unknown email or no pending login code; `forgot-password` answers `sent` for unknown, blocked and cooling-down accounts
- Inputs: names and codes through `readTrimmed`, emails through `readEmail`
- Session id regenerated at login (`startUserSession`) and on password/email change; the other sessions of the user are destroyed (`destroyUserSessions(userId, req.sessionID)`); a password reset destroys all of them
- Absolute session lifetime: `SESSION_ABSOLUTE_MAX_AGE_MS` (30 days from `createdAt`), checked by `requireAuth`; a session without `createdAt` is rejected, so logins from before this check must sign in again once
- Email send failures surface as 502 `error.emailFailed` (`deliverEmail`)
- Rate limiting per endpoint type
- COOKIE_SECRET required in production (32+ characters, placeholders refused); `NODE_HOST` must be a public https origin or boot fails
- IP blocking for brute-force prevention

## Session management

- `express-session` with `session-file-store` (`src/api/http/session.js`), directory `logs/sessions/` (`SESSION_DIR`); the files are cleared at every production boot
- Cookie `app.sid`: `sameSite: 'lax'`, `httpOnly`, `secure` in production; cookie `maxAge` 7 days (`SESSION_IDLE_MAX_AGE_MS`) plus the absolute 30-day cap
- `req.session.userId` is a string - validate with `parseObjectId()`
- `destroyUserSessions(userId, excludeSessionId)` - deletes every session file of the user except the optional excluded one
- Client IP is `req.ip` (`getClientIp`), resolved through `trust proxy` = 1

## Captcha integration

- **Server** (`shared/captcha.js`): `verifyCaptcha(token, expectedAction)` verifies the reCAPTCHA v3 token with Google. Outside production it always passes; in production it fails closed (missing secret, missing token, invalid, wrong action, low score or Google unreachable all reject). Signup and contact answer 400 `error.auth.captchaFailed`
- **Client** (`composables/useCaptcha.js`): reads the site key from `<meta name="recaptcha-site-key">`, loads the script on demand, exposes `executeRecaptcha(action)`; returns `null` when no key is exposed

## Middleware

- `resolveSession(req, db, projection)` (`src/api/middleware.js`) — the single session resolver: parses `req.session.userId`, checks the absolute lifetime, that the user exists and is not blocked; an invalid session is destroyed (awaited) before it answers. Used by `requireAuth` and `GET /api/auth/me`
- `requireAuth` — 401/403 from the resolver, else sets `req.userId` and `req.authUser`
- `requireAdmin` — plain middleware placed after `requireAuth` (`requireAuth, requireAdmin`, no `db` argument); 401 without `req.authUser`, 403 unless `type` is admin

## Where to look

| If you need…               | Read                                                         |
| -------------------------- | ------------------------------------------------------------ |
| Full security flow details | [references/security-flow.md](./references/security-flow.md) |
