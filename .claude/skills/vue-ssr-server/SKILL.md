---
name: vue-ssr-server
description: "Server/backend reference for the Vue SSR Starter Kit (e-xode/vue-ssr): Express 5 API route mechanics, middleware guards, MongoDB access, and server-only shared utilities. Trigger on backend/API route work: adding or editing an Express route, wiring the router, MongoDB queries and indexes, request validation, rate limiting, or server-side shared utilities. Don't use for: auth flow specifics like security codes/sessions/captcha logic (→ vue-ssr-auth), file structure/SSR lifecycle/routing (→ vue-ssr-architecture), Docker/CI/production config (→ vue-ssr-deployment), post-task validation (→ vue-ssr-validation), Vue/client code (→ vue agent)."
---

# Vue SSR Server (Backend: Express 5 + MongoDB)

> Owns Express 5 API route mechanics and MongoDB data access. Auth domain logic → `vue-ssr-auth`; file structure/SSR lifecycle → `vue-ssr-architecture`. Security guardrails live in rule `server-security`; error/ObjectId handling in rule `api-error-handling`.

## Division of responsibilities (vue-ssr-architecture ↔ vue-ssr-server)

| Concern                                                                   | Owner                 |
| -------------------------------------------------------------------------- | --------------------- |
| File structure, SSR lifecycle, locale routing, new view/feature scaffolding | `vue-ssr-architecture` |
| Express route mechanics, middleware guards, rate limiters, MongoDB queries/indexes | `vue-ssr-server` |

| Which endpoints need auth protection, and the auth-domain logic itself | vue-ssr-auth |
## Server entry (`server.js`)

`server.js` is thin wiring; each concern lives in `src/api/http/`. Boot order: `assertProductionSiteUrl` + `assertProductionSecret` → `mongoConnect()` → `ensureIndexes(db)` → (prod) `clearSessionFiles()` → `express()` with `trust proxy` = 1 → `helmet` (`hardening.js`, CSP from `csp.js`) → `GET /healthz` → (prod) rate limits → `/sitemap.xml` + `/robots.txt` (`seo.js`) → `session` (`session.js`) → `cors` → `express.json()` → API router → (prod) `/uploads` + compressed client bundle (`static.js`) → `redirectMiddleware` → SSR catch-all (`ssr.js`).

| Module (`src/api/http/`) | Role |
| --- | --- |
| `constants.js` | Session idle age, rate-limit ceilings, static cache ages, shutdown timeout, `HEALTH_PATH`, redirect statuses/prefixes |
| `csp.js` | `buildCsp(production)`: no `'unsafe-inline'` in `scriptSrc`; `'unsafe-inline'`/`'unsafe-eval'` and `ws:`/`wss:` only in dev |
| `hardening.js` | `createHelmet`, `applyRateLimits` (global + `/api/`), `createCors` (localhost + `NODE_HOST` allowlist) |
| `session.js` | `createSessionMiddleware`, `assertProductionSecret`, `clearSessionFiles` |
| `indexes.js` | `ensureIndexes(db)` |
| `readiness.js` / `shutdown.js` | `/healthz` (200 `ok` once listening, 503 while booting or shutting down) and the SIGTERM/SIGINT drain: not ready → close HTTP server → `mongoClose()` → exit (forced exit after 10 s) |
| `redirects.js` | `GET`/`HEAD` only: `/` → 302 to `/{locale}` from `Accept-Language` (`Vary: Accept-Language`); 301 to the canonical localized path (missing locale prefix, slug in the wrong locale, trailing slash) |
| `seo.js` | `robots.txt` + cached `sitemap.xml` (see skill `seo`) |
| `static.js` | `/uploads` (prod only, 404 on miss) and the hashed-assets / client bundle |
| `dev.js` | Dev: Vite middleware mode, API reloaded per request through `vite.ssrLoadModule`. Prod: static import of `createApiRouter(db)` |
| `ssr.js` / `template.js` | SSR renderer, template markers `<!--app-lang|theme|head|state|html-->`, `<script type="application/json" id="__SSR_STATE__">` (see skill `vue-ssr-architecture`) |

Add a new HTTP-host concern as a module in `src/api/http/` and wire it from `server.js`; keep `server.js` free of logic.

## Route-module pattern

Each endpoint is a file exporting `setupXRoute(app, db)`:

```javascript
import { getUserWithCounts } from '#src/shared/dbHelpers.js';

export function setupMeRoute(app, db) {
  app.get('/api/auth/me', async (req, res) => {
    try {
      const user = await getUserWithCounts(db, req.session.userId);
      res.json({ user });
    } catch (err) {
      console.error('Me endpoint error:', err);
      res.status(500).json({ error: 'error.server' });
    }
  });
}
```

- Register the setup function inside `createApiRouter(db)` in `router.js`.
- Error `error` fields are i18n keys (`error.server`, `error.unauthorized`) resolved client-side.
- The try/catch → `console.error` → 500 shape is mandatory — see rule `api-error-handling`.

## Folder map

```
src/api/
  router.js        createApiRouter(db) + per-endpoint limiters
  middleware.js    setMiddlewareDb, requireAuth, requireAdmin
  emailDelivery.js deliverEmail(res, sending): 502 error.emailFailed when sending fails
  http/            HTTP-host modules wired by server.js (csp, hardening, session, ...)
  auth/            signin, signup, signout, me, verifyCode, ... (setupXRoute)
  admin/           users, logs (admin-guarded)
  contact/         send
```

## Middleware guards (`src/api/middleware.js`)

- `requireAuth` — 401 if no valid `req.session.userId`, or if the session is past `SESSION_ABSOLUTE_MAX_AGE_MS` / has no `createdAt` (`isSessionExpired`); destroys the session on unknown user (401) or `user.isBlocked` (403); sets `req.userId` (ObjectId) and `req.authUser`.
- `requireAdmin(db)` — factory middleware; 401 without a session user, 403 unless `user.type === 'admin'`.
- `setMiddlewareDb(db)` — call once from `createApiRouter` before `requireAuth` is used.

```javascript
app.get('/api/admin/users', requireAdmin(db), async (req, res) => { ... });
```

## MongoDB access

- Single shared client from `src/shared/mongo.js`: `mongoConnect()` returns `{ db, error }`; `mongoClose()` on shutdown.
- Inject the existing `db` into every route — never open a client per request.
- Validate ids with `parseObjectId(str)` from `src/shared/dbHelpers.js` (returns ObjectId or null) before any `_id` query.
- `parsePagination(req.query)` for list endpoints; richer accessors (e.g. `getUserWithCounts(db, id)`) live in `dbHelpers.js`.
- Indexes are declared in `ensureIndexes(db)` in `src/api/http/indexes.js` (users.email unique, blockedIps.ip unique, logs `createdAt`/`event`/`userId`).
- Client IP: `getClientIp(req)` (`req.ip`, which honours `trust proxy`); never read `x-forwarded-for` by hand.
- A failed email send is reported with `deliverEmail(res, sending)` from `src/api/emailDelivery.js` (502 `error.emailFailed`), not swallowed.

## Rate limiting (`src/api/router.js`)

`createLimiter(max)` returns a real limiter in production and a pass-through in dev. Pre-built: `signupLimiter` (5), `authLimiter` (10), `accountLimiter` (20), `contactLimiter` (3). Mount before the route via `router.use('/api/...', limiter)`. Global (500) + `/api/` (300) ceilings per 15 min (production only) live in `src/api/http/hardening.js` / `constants.js`.

## Server-only shared utilities

- `src/shared/email.js` — nodemailer transporter, security-code email (uses `node:crypto`).
- `src/shared/security.js` — `getClientIp`, ban checks, session helpers (`startUserSession`, `destroyUserSessions`, `isSessionExpired`), file-based (`node:fs`/`node:path`).
- `src/shared/captcha.js` — reCAPTCHA v3 verification (fails closed in production).
- `src/shared/log.js` — `logInfo`/`logWarn` structured logging, filtered by `LOG_LEVEL`.

These are server-only — never import them from client code (rule `client-server-boundary`). Auth-specific logic (security-code generation, hashing, sessions, captcha flow): see skill `vue-ssr-auth`.
