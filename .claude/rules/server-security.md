---
paths:
  - 'server.js'
  - 'src/api/**'
---

# Server security

Hard guardrails for the Express host. Full setup: see skills `vue-ssr-server` and `vue-ssr-deployment`.

**Always:**

- Mount `helmet` first, before session, CORS, and routes. Do not disable its defaults wholesale.
- Keep the CSP accurate: `scriptSrc` allows `'unsafe-inline'` plus analytics/reCAPTCHA origins; `'unsafe-eval'` and `ws:`/`wss:` in `connectSrc` are **dev-only** (Vite HMR), GA origins are added in production.
- Drive CORS from an allowlist (localhost + `NODE_HOST`) with `credentials: true`. Never `origin: '*'`.
- Apply rate limiting in **production only** (global + `/api/` in `server.js`); per-endpoint limiters (`signup`/`auth`/`account`/`contact`) live in `src/api/router.js` and no-op in dev.
- Session cookie: `sameSite: 'lax'`, `httpOnly: true`, `secure` in production, `path: '/'`. Set `trust proxy` before the session middleware. Require `COOKIE_SECRET` in production.

**Never:** log secrets, full session contents, or credentials; echo raw user input back unshaped.

**Shutdown:** handle SIGTERM/SIGINT → `await mongoClose()` → `process.exit(0)`.
