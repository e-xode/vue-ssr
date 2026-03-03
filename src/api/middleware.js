import { ObjectId } from 'mongodb'

let _db = null

export function setMiddlewareDb(db) {
  _db = db
}

export async function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'error.unauthorized' })
  }
  req.userId = new ObjectId(req.session.userId)

  if (_db) {
    try {
      const user = await _db.collection('users').findOne(
        { _id: req.userId },
        { projection: { isBlocked: 1 } }
      )
      if (user?.isBlocked) {
        req.session.destroy(() => {})
        return res.status(403).json({ error: 'error.auth.blocked' })
      }
    } catch (err) {
      console.error('Auth blocked check error:', err)
    }
  }
  next()
}

export function requireAdmin(db) {
  return async (req, res, next) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'error.unauthorized' })
    }
    try {
      const userId = new ObjectId(req.session.userId)
      const user = await db.collection('users').findOne(
        { _id: userId },
        { projection: { type: 1 } }
      )
      if (!user || user.type !== 'admin') {
        return res.status(403).json({ error: 'error.forbidden' })
      }
      req.userId = userId
      next()
    } catch {
      res.status(500).json({ error: 'error.server' })
    }
  }
}
