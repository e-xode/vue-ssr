---
paths:
  - 'src/api/**/*.js'
---

# API error handling

Every API route handler MUST follow this pattern:

- Wrap handler body in `try/catch`
- `catch` block: `console.error(err)` + `res.status(500).json({ error: 'error.server' })`
- The `error` field is always an i18n key (e.g. `error.invalidId`, `error.validation`), never a plain English string
- Use appropriate rate limiters (authLimiter, accountLimiter, contactLimiter, apiLimiter)

ObjectId validation before a query: see rule `server-scope-guard`. Stack-trace exposure in production: see rule `server-security`.
