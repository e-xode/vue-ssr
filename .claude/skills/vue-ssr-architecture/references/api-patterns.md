# API patterns

## Endpoint structure

```js
export function setupMyFeatureRoute(app, db) {
  app.post('/api/my-feature', async (req, res) => {
    try {
      res.json({ status: 'success', data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
}
```

Register it inside `createApiRouter(db)` in `src/api/router.js` — that factory builds and
returns an `express.Router()` (rate limiters + every `setupXRoute(router, db)`). The
handler shape above is unchanged: it receives the router in place of `app`.

In dev the whole API layer hot-reloads through Vite's module graph: `server.js` mounts it
via `vite.ssrLoadModule('/src/api/router.js')` per `/api` request, so editing any route
takes effect on the next request with no process restart and the HMR socket intact. In
prod the router is built once at startup.

## Endpoints inventory

### Auth (signupLimiter: 5/15min; authLimiter: 10/15min; accountLimiter: 20/15min)

POST /api/auth/signup (signupLimiter)
POST /api/auth/signin, /verify-code, /resend-code, /forgot-password, /reset-password (authLimiter, no auth required)
POST /api/auth/signout, GET /me, PUT /profile, POST /avatar, /change-password, /change-email (accountLimiter, auth required)

### Contact (contactLimiter: 3/15min)

POST /api/contact (no auth)

### Admin (requireAdmin — no rate limiter)

GET/PUT/DELETE /api/admin/users[/:id], POST /block
GET/DELETE /api/admin/logs[/:id], POST /bulk-delete

### Sitemap

GET /sitemap.xml — Dynamic generation from routes, cached 1h TTL

## Rate limiting strategy

Limiter names and values are owned by the `vue-ssr-server` skill (its "Rate limiting" section) —
this inventory only maps limiters to endpoints; read there for the authoritative numbers.
`signupLimiter`, `authLimiter`, `accountLimiter`, `contactLimiter` — that is the complete set.
Admin endpoints are protected by the `requireAdmin` middleware guard, not a rate limiter.

## apiFetch (client-side)

Client fetch wrapper in `shared/api.js`:

- AbortController with 15s timeout
- Content-type detection: auto-parses JSON, returns text for non-JSON
- FormData support (no Content-Type header for multipart)
- Rate-limit detection: sets `error.isRateLimit = true` on 429
- safeJson() wrapper for resilient JSON parsing
