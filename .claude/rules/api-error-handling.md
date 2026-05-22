---
paths:
  - 'src/api/**/*.js'
---

# API error handling

Every API route handler MUST follow this pattern:

- Wrap handler body in `try/catch`
- `catch` block: `console.error(err)` + `res.status(500).json({ error: 'Server error' })`
- Never expose stack traces in production (error details only in dev)
- Use appropriate rate limiters (authLimiter, accountLimiter, contactLimiter, apiLimiter)

## ObjectId validation

- Always validate MongoDB ObjectId before performing queries
- Use `parseObjectId(str)` from `shared/dbHelpers.js` — returns a valid ObjectId or null
- `req.session.userId` is a string — convert with `new ObjectId(str)` after validation
- Never pass user-supplied strings directly to MongoDB `_id` queries without validation
- Return early on validation failure: `res.status(400).json({ error: 'Invalid ID' })`
