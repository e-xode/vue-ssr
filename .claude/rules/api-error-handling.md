---
paths:
  - 'src/api/**/*.js'
---

# API error handling

Every API route handler MUST follow this pattern:

- Wrap handler body in `try/catch`
- `catch` block: `console.error(err)` + `res.status(500).json({ error: 'Server error' })`
- Never expose stack traces in production (error details only in dev)
- Validate ObjectId with `parseObjectId()` from `shared/dbHelpers.js` before any MongoDB query
- Return early on validation failure: `res.status(400).json({ error: 'Invalid ID' })`
- Use appropriate rate limiters (authLimiter, accountLimiter, contactLimiter, apiLimiter)
