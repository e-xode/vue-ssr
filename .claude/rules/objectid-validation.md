---
paths:
  - 'src/api/**/*.js'
  - 'src/shared/dbHelpers.js'
---

# ObjectId validation

Always validate MongoDB ObjectId before performing queries.

- Use `parseObjectId(str)` from `shared/dbHelpers.js`
- `parseObjectId` returns a valid ObjectId or null — check the return value
- `req.session.userId` is a string — convert with `new ObjectId(str)` after validation
- Never pass user-supplied strings directly to MongoDB `_id` queries without validation
- Return 400 immediately if ObjectId is invalid: `res.status(400).json({ error: 'Invalid ID' })`
