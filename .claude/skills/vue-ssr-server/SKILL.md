---
name: vue-ssr-server
description: "Server/backend reference for the Vue SSR Starter Kit (e-xode/vue-ssr): Express 5 API layer (createApiRouter(db) entry, setupXRoute(app, db) route-module pattern, routes under src/api/auth|admin|contact), auth/admin middleware guards (requireAuth, requireAdmin, setMiddlewareDb), MongoDB singleton lifecycle (mongoConnect/mongoClose, ensureIndexes), data-access helpers (parseObjectId, parsePagination from dbHelpers.js), per-endpoint rate limiters (createLimiter, production-only), and server-only shared utilities (email, security, captcha, log). Trigger on backend/API route work: adding or editing an Express route, wiring the router, MongoDB queries and indexes, request validation, rate limiting, or server-side shared utilities. Don't use for: auth flow specifics like security codes/sessions/captcha logic (→ vue-ssr-auth), file structure/SSR lifecycle/routing (→ vue-ssr-architecture), Docker/CI/production config (→ vue-ssr-deployment), post-task validation (→ vue-ssr-hooks), Vue/client code (→ vue agent)."
---

# Vue SSR Server (Backend: Express 5 + MongoDB)

> Owns Express 5 API route mechanics and MongoDB data access. Auth domain logic → `vue-ssr-auth`; file structure/SSR lifecycle → `vue-ssr-architecture`. Security guardrails live in rule `server-security`; error/ObjectId handling in rule `api-error-handling`.

## Server entry (`server.js`)

Boot order: `mongoConnect()` → `ensureIndexes(db)` → `express()` → `helmet` → (prod) rate limits → `session` → `cors` → `express.json()` → API router → SSR catch-all. The API is mounted via `createApiRouter(db)`: in dev through `vite.ssrLoadModule('/src/api/router.js')`, in prod via static import.

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
  auth/            signin, signup, signout, me, verifyCode, ... (setupXRoute)
  admin/           users, logs (admin-guarded)
  contact/         send
```

## Middleware guards (`src/api/middleware.js`)

- `requireAuth` — 401 if no `req.session.userId`; sets `req.userId` (ObjectId); destroys session + 403 if `user.isBlocked`.
- `requireAdmin(db)` — factory middleware; 403 unless `user.type === 'admin'`.
- `setMiddlewareDb(db)` — call once from `createApiRouter` before `requireAuth` is used.

```javascript
app.get('/api/admin/users', requireAdmin(db), async (req, res) => { ... });
```

## MongoDB access

- Single shared client from `src/shared/mongo.js`: `mongoConnect()` returns `{ db, error }`; `mongoClose()` on shutdown.
- Inject the existing `db` into every route — never open a client per request.
- Validate ids with `parseObjectId(str)` from `src/shared/dbHelpers.js` (returns ObjectId or null) before any `_id` query.
- `parsePagination(req.query)` for list endpoints; richer accessors (e.g. `getUserWithCounts(db, id)`) live in `dbHelpers.js`.
- Indexes are declared in `ensureIndexes(db)` in `server.js` (users.email unique, blockedIps.ip unique, logs).

## Rate limiting (`src/api/router.js`)

`createLimiter(max)` returns a real limiter in production and a pass-through in dev. Pre-built: `signupLimiter` (5), `authLimiter` (10), `accountLimiter` (20), `contactLimiter` (3). Mount before the route via `router.use('/api/...', limiter)`. Global + `/api/` ceilings (production only) live in `server.js`.

## Server-only shared utilities

- `src/shared/email.js` — nodemailer transporter, security-code email (uses `node:crypto`).
- `src/shared/security.js` — file-based helpers (`node:fs`/`node:path`).
- `src/shared/captcha.js` — reCAPTCHA v3 verification.
- `src/shared/log.js` — `logInfo`/`logWarn` structured logging.

These are server-only — never import them from client code (rule `client-server-boundary`). Auth-specific logic (security-code generation, hashing, sessions, captcha flow): see skill `vue-ssr-auth`.
