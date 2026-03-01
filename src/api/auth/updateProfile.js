import { requireAuth } from '../middleware.js'
import { logEvent } from '#src/shared/logger.js'

export function setupUpdateProfileRoute(app, db) {
  app.put('/api/auth/profile', requireAuth, async (req, res) => {
    try {
      const { name } = req.body

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'error.missingFields' })
      }

      const updates = { name: name.trim() }

      await db.collection('users').updateOne(
        { _id: req.userId },
        { $set: updates }
      )

      logEvent(db, { event: 'user-update-profile', userId: req.userId, ip: req.ip, meta: { fields: Object.keys(updates) } })

      res.json({ status: 'ok' })
    } catch (err) {
      console.error('Update profile error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })
}
