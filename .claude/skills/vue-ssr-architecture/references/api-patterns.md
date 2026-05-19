# API patterns

## Endpoint structure

```js
export function setupMyFeatureRoute(app, db) {
  app.post('/api/my-feature', async (req, res) => {
    try {
      res.json({ status: 'success', data })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Server error' })
    }
  })
}
```

Register in `src/api/router.js`.

## Endpoints inventory

### Auth (authLimiter: 10/15min, accountLimiter: 20/15min)

POST /api/auth/signup, /signin, /verify-code, /resend-code, /forgot-password, /reset-password (no auth)
POST /api/auth/signout, GET /me, PUT /profile, POST /avatar, /change-password, /change-email (auth required)

### Contact (contactLimiter: 3/15min)

POST /api/contact (no auth)

### Admin (apiLimiter: 100/15min, requiresAdmin)

GET/PUT/DELETE /api/admin/users[/:id], POST /block
GET/DELETE /api/admin/logs[/:id], POST /bulk-delete

### Sitemap

GET /sitemap.xml — Dynamic generation from routes, cached 1h TTL

## Rate limiting strategy

| Limiter | Limit | Window | Endpoints |
|---------|-------|--------|-----------|
| authLimiter | 10 req | 15 min | signup, signin, verify, reset |
| accountLimiter | 20 req | 15 min | profile, password, email changes |
| contactLimiter | 3 req | 15 min | POST /api/contact |
| apiLimiter | 100 req | 15 min | admin endpoints |

## apiFetch (client-side)

Client fetch wrapper in `shared/api.js`:
- AbortController with 15s timeout
- Content-type detection: auto-parses JSON, returns text for non-JSON
- FormData support (no Content-Type header for multipart)
- Rate-limit detection: sets `error.isRateLimit = true` on 429
- safeJson() wrapper for resilient JSON parsing
