# API reference

All endpoints live under `/api`, accept and return JSON, and rely on the session cookie (`app.sid`,
`HttpOnly`, `SameSite=Lax`, `Secure` in production). The browser client is `apiFetch()` in
`src/shared/api.js`.

## Conventions

- **Errors** are always `{ "error": "<i18n key>" }` with a meaningful status. The key is translated
  on the client (`src/translate/*.json`, under `error.*`). This includes a malformed JSON body (400
  `error.validation`), an unknown API path (404 `error.notFound`), a refused CORS origin (403
  `error.forbidden`) and an unexpected failure (500 `error.server`).
- **Inputs must be strings.** An object where a string is expected (for example
  `{"email": {"$ne": null}}`) is treated as missing. Emails are trimmed and lower-cased; names and
  codes are trimmed.
- **Authentication.** "Session" below means a signed-in, non-blocked user whose session is younger
  than the absolute lifetime (30 days); otherwise the answer is 401 `error.unauthorized` (403
  `error.auth.blocked` for a blocked account) and the session is destroyed. "Admin" additionally
  requires `type: "admin"` (403 `error.forbidden`).
- **Security codes** are 6 digits, valid 10 minutes, 3 attempts per code. Ten wrong codes within an
  hour lock code verification for the account until the hour has passed, even if new codes are
  requested.

## Rate limits (production only)

Window: 15 minutes, per client IP. Exceeding a limit answers 429 `error.rateLimit`.

| Scope                                                                                | Requests |
| ------------------------------------------------------------------------------------ | -------- |
| `POST /api/auth/signup`                                                              | 5        |
| `signin`, `verify-code`, `resend-code`, `forgot-password`, `reset-password`          | 10 each  |
| `change-email`, `verify-email-change`, `change-password`                             | 20 each  |
| `POST /api/contact`                                                                  | 3        |
| Any `/api/*` request                                                                 | 300      |
| Any other request (static files are served before the limiter and are not counted)   | 500      |

## Authentication

| Method | Path                            | Access  | Body                              | Success                                    |
| ------ | ------------------------------- | ------- | --------------------------------- | ------------------------------------------ |
| POST   | `/api/auth/signup`              | Public  | `email, password, name, locale?, captchaToken` | `{ status: "verification_pending", email }` |
| POST   | `/api/auth/signin`              | Public  | `email, password, locale?`        | `{ status: "verification_pending", email }` |
| POST   | `/api/auth/verify-code`         | Public  | `email, code`                     | `{ status: "verified", user }`             |
| POST   | `/api/auth/resend-code`         | Public  | `email, locale?`                  | `{ status: "code_sent", email }`           |
| POST   | `/api/auth/forgot-password`     | Public  | `email, locale?`                  | `{ status: "sent" }`                       |
| POST   | `/api/auth/reset-password`      | Public  | `email, code, password`           | `{ status: "ok" }`                         |
| POST   | `/api/auth/signout`             | Public  | none                              | `{ status: "success" }`                    |
| GET    | `/api/auth/me`                  | Public  | none                              | `{ user }` or `{ user: null }`             |
| PUT    | `/api/auth/profile`             | Session | `name`                            | `{ status: "ok" }`                         |
| POST   | `/api/auth/avatar`              | Session | multipart, field `avatar`         | `{ avatar }`                               |
| DELETE | `/api/auth/avatar`              | Session | none                              | `{ status: "ok" }`                         |
| POST   | `/api/auth/change-password`     | Session | `currentPassword, newPassword`    | `{ status: "ok" }`                         |
| POST   | `/api/auth/change-email`        | Session | `newEmail, locale?`               | `{ status: "ok" }`                         |
| POST   | `/api/auth/verify-email-change` | Session | `code`                            | `{ status: "ok", email }`                  |

Notes:

- `user` contains only `_id`, `email`, `name`, `type`, `avatar`, `isBlocked`, `createdAt` and
  `updatedAt` (`USER_SAFE_PROJECTION`, an allowlist). Password hashes, codes and counters never
  leave the server.
- **Sign-up** requires a password of 8+ characters and a name of 2+ characters; an existing address
  answers 400 `error.auth.emailAlreadyUsed`. `captchaToken` is a reCAPTCHA v3 token for the action
  `signup`; it is ignored outside production.
- **Sign-in** is two steps: the password, then the emailed code. Wrong credentials answer 401
  `error.auth.invalidCredentials`.
- **verify-code** answers 401 `error.auth.invalidCode` for a wrong code (with `attempts`, the
  number left), and the same error for an unknown address or an address with no pending login code,
  so the endpoint does not reveal which accounts exist. Other answers: 400 `error.auth.codeExpired`,
  429 `error.auth.tooManyAttempts`.
- **A code only works for what it was issued for.** A password-reset code is refused by
  `verify-code`, and a login code is refused by `reset-password` (400
  `error.auth.invalidResetRequest`).
- **resend-code** re-issues the pending code (login or password reset) at most every 30 seconds
  (429 `error.auth.waitBeforeResend` with `waitSeconds`) and always answers `code_sent` for an
  unknown address.
- **forgot-password** always answers `sent`, whether the address exists, is blocked, or was sent a
  code less than 30 seconds ago.
- **reset-password** signs the account out everywhere. **change-password** and
  **verify-email-change** end the other sessions and rotate the current one.
- **Avatar**: JPEG, PNG or WebP, 2 MB maximum (413 `error.avatar.tooLarge`, 415
  `error.avatar.invalidType`). Files are stored under `public/uploads/avatars/`.
- A failed email delivery answers 502 `error.emailFailed`.

## Contact

| Method | Path           | Access | Body                                          | Success            |
| ------ | -------------- | ------ | --------------------------------------------- | ------------------ |
| POST   | `/api/contact` | Public | `name, email, message, locale?, captchaToken` | `{ status: "ok" }` |

The message (5000 characters maximum) is emailed to `MAILER_TO`, or `MAILER_FROM` when unset.
reCAPTCHA action: `contact`.

## Administration

All routes require an admin session.

| Method | Path                               | Purpose                                                     |
| ------ | ---------------------------------- | ----------------------------------------------------------- |
| GET    | `/api/admin/users`                 | List users. Query: `page`, `limit` (max 100), `search`      |
| GET    | `/api/admin/users/:userId`         | One user with login history and the 10 latest log entries   |
| PUT    | `/api/admin/users/:userId`         | Update `name` and/or `type` (`user`, `admin`)               |
| PUT    | `/api/admin/users/:userId/block`   | Block the account. Body: `blockIps?`                        |
| PUT    | `/api/admin/users/:userId/unblock` | Unblock. Body: `unblockIps?`                                |
| DELETE | `/api/admin/users/:userId`         | Delete the account                                          |
| GET    | `/api/admin/blocked-ips`           | List blocked IPs                                            |
| POST   | `/api/admin/blocked-ips`           | Block an IP. Body: `ip`, `reason?`                          |
| DELETE | `/api/admin/blocked-ips/:ip`       | Unblock an IP                                               |
| GET    | `/api/admin/logs`                  | Audit log. Query: `page`, `perPage`, `event` (comma-separated), `userId`, `from`, `to`, `search` |
| GET    | `/api/admin/logs/events`           | Distinct event names                                        |
| DELETE | `/api/admin/logs/:id`              | Delete one entry                                            |
| DELETE | `/api/admin/logs`                  | Delete several entries. Body: `ids`                         |

Safeguards:

- An admin cannot remove their own admin role (400 `error.admin.cannotDemoteSelf`) nor delete their
  own account (400 `error.admin.cannotDeleteSelf`).
- An admin account cannot be blocked or deleted (400 `error.admin.cannotModifyAdmin`); remove its
  admin role first.
- Blocking with `blockIps: true` blocks only the most recent login IP of the user.
- Deleting a user also ends their sessions and removes their IP blocks, their log entries and
  their avatar file.
- Log entries expire after 90 days (`LOG_RETENTION_DAYS` in `src/shared/const.js`).

## Other endpoints

| Method | Path           | Purpose                                                                         |
| ------ | -------------- | ------------------------------------------------------------------------------- |
| GET    | `/healthz`     | Readiness: 200 `{ "status": "ok" }`, or 503 while starting or shutting down     |
| GET    | `/sitemap.xml` | Generated from the public pages                                                 |
| GET    | `/robots.txt`  | Generated; disallows the authentication, account and admin paths                |
| POST   | `/api/dev/login` | Development only, off by default: see the comments in `.env.example`          |
