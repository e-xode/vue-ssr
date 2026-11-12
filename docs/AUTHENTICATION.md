# Authentication

Authentication is session-based and two-step: a password, then a 6-digit code sent by email. There
are no JWTs and no third-party identity provider. Endpoint details are in [API.md](./API.md).

## Flows

**Sign-up.** `POST /api/auth/signup` validates the input, checks the reCAPTCHA token (production),
stores the user with a bcrypt password hash (10 rounds) and a login code, and emails the code. The
session opens only once the code has been verified.

**Sign-in.** `POST /api/auth/signin` checks the password, stores a new login code and emails it.
`POST /api/auth/verify-code` then opens the session.

**Password reset.** `POST /api/auth/forgot-password` emails a reset code;
`POST /api/auth/reset-password` checks it, stores the new password and ends every session of the
account.

**Email change.** `POST /api/auth/change-email` emails a code to the new address;
`POST /api/auth/verify-email-change` applies the change, ends the other sessions and rotates the
current one.

## Security codes

| Property        | Value                                                                              |
| --------------- | ---------------------------------------------------------------------------------- |
| Format          | 6 digits from `crypto.randomInt`                                                   |
| Storage         | SHA-256 hash only, compared with `timingSafeEqual`                                 |
| Lifetime        | 10 minutes (`SECURITY_CODE_EXPIRY_MS`)                                             |
| Attempts        | 3 per code (`SECURITY_CODE_MAX_ATTEMPTS`), counted atomically in MongoDB           |
| Account lockout | 10 wrong codes within 1 hour lock verification until the hour has passed           |
| Resend cooldown | 30 seconds (`RESEND_COOLDOWN_MS`)                                                  |
| Purpose         | `login` or `reset-password`; a code is refused by the other flow                   |

The attempt counter is incremented by a conditional update before the code is compared, so
parallel requests cannot exceed the limit. The lockout counter survives new codes: asking for a
fresh code does not reset it. All constants are in `src/shared/const.js`; the helpers
(`createSecurityCode`, `checkSubmittedCode`, `claimCodeAttempt`) are in `src/shared/security.js`.

In development, when `MAILER_HOST` is not set, no email is sent and every code is written to the
server console. This never happens when `NODE_ENV=production`.

## Sessions

- `express-session` with a file store under `logs/sessions/`; cookie `app.sid`, `HttpOnly`,
  `SameSite=Lax`, `Secure` in production.
- **Idle lifetime** 7 days (cookie `maxAge`), **absolute lifetime** 30 days from sign-in.
- The session id is regenerated when a code is verified (no session fixation) and rotated after a
  password or email change.
- One function, `resolveSession()` in `src/api/middleware.js`, decides whether a session is valid
  for `requireAuth`, `requireAdmin` and `GET /api/auth/me`: the user must exist, must not be
  blocked, and the session must be younger than the absolute lifetime. An invalid session is
  destroyed.
- In production, session files are cleared at every server start: **a restart signs everyone
  out**. The file store also means a single server instance. Replace the store in
  `src/api/http/session.js` if you need persistence or several instances.

## What the API returns about a user

Responses use an allowlist, `USER_SAFE_PROJECTION`: `_id`, `email`, `name`, `type`, `avatar`,
`isBlocked`, `createdAt`, `updatedAt`. Admin responses add `blockedAt` and `loginHistory`
(`ADMIN_USER_PROJECTION`). A new field is private until it is added to one of these lists.

## Blocking

- **Accounts.** An admin can block a user: their sessions end at once and sign-in answers 403
  `error.auth.blocked`.
- **IP addresses.** Blocked IPs are refused on every authentication route. The client IP is
  `req.ip` with `trust proxy` set to 1; the `X-Forwarded-For` header is never read directly.
- The last 50 sign-in IPs of each user are kept in `loginHistory` for the admin panel.

## Account enumeration

`forgot-password`, `resend-code` and `verify-code` answer the same way whether or not the address
has an account. `signup` does reveal that an address is taken (400
`error.auth.emailAlreadyUsed`); this is a deliberate usability trade-off, limited by the sign-up
rate limit and reCAPTCHA.

## Roles and the first admin

Users have a `type`: `user` or `admin`. New accounts are always `user`. Promote the first admin
from the command line, then manage roles in the admin panel:

```bash
npm run seed:admin -- you@example.com
```

## reCAPTCHA v3

Sign-up and the contact form verify a reCAPTCHA v3 token server-side (`src/shared/captcha.js`):
the action must match, and the score must reach `RECAPTCHA_MIN_SCORE` (default 0.5). The check is
skipped outside production. **In production it fails closed**: without `RECAPTCHA_SECRET_KEY`,
when Google does not answer within 5 seconds, or on any error, the request is refused. The server
logs a warning at startup when a key is missing.

## Development sign-in for automated tools

`POST /api/dev/login` signs in one fixed test account without a password, for visual QA and
automation. It exists only when `NODE_ENV` is not `production`, `DEV_LOGIN_ENABLED=true` and
`DEV_LOGIN_TOKEN` is at least 32 characters, sent in the `x-dev-login-token` header. Create the
account with `npm run seed:dev-user`. See `.env.example`.
