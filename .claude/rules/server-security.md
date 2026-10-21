---
paths:
  - 'server.js'
  - 'src/api/**'
---

# Server security

Hard guardrails for the Express host. Charter: this rule governs HTTP-host hardening; rule `server-scope-guard` governs what may be imported/referenced. Full setup: see skills `vue-ssr-server` and `vue-ssr-deployment`.

**Always:**

- Mount `helmet` first, before session, CORS, and routes. Do not disable its defaults wholesale.
- Never widen the CSP (`src/api/http/csp.js`) — no `'unsafe-inline'` in `scriptSrc`; `'unsafe-inline'`/`'unsafe-eval'` scripts and `ws:`/`wss:` in `connectSrc` stay dev-only (Vite HMR). Inline data goes in `<script type="application/json">` or `<meta>`, not inline JS.
- Drive CORS from an allowlist (localhost + `NODE_HOST`) with `credentials: true`. Never `origin: '*'`.
- Apply rate limiting in **production only** (global + `/api/` in `src/api/http/hardening.js`); per-endpoint limiters (`signup`/`auth`/`account`/`contact`) live in `src/api/router.js` and no-op in dev.
- Session cookie: `sameSite: 'lax'`, `httpOnly: true`, `secure` in production, `path: '/'`. Set `trust proxy` before the session middleware. Require `COOKIE_SECRET` and a public https `NODE_HOST` in production (boot fails otherwise).
- Regenerate the session id on login and on password/email change (`startUserSession`); `requireAuth` rejects sessions past the absolute lifetime.
- Never expose stack traces in production — error details only in dev.

**Never:** log secrets, full session contents, or credentials; echo raw user input back unshaped.
