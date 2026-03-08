import bcrypt from 'bcryptjs'
import { requireAuth } from '../middleware.js'
import { BCRYPT_ROUNDS } from '#src/shared/const.js'
import { destroyUserSessions } from '#src/shared/security.js'
import { logEvent } from '#src/shared/logger.js'

export function setupChangePasswordRoute(app, db) {
  app.post('/api/auth/change-password', requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'error.missingFields' })
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'error.auth.passwordTooShort' })
      }

      const user = await db.collection('users').findOne(
        { _id: req.userId },
        { projection: { password: 1 } }
      )

      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) {
        return res.status(400).json({ error: 'error.auth.wrongPassword' })
      }

      const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
      await db.collection('users').updateOne(
        { _id: req.userId },
        { $set: { password: hashedPassword } }
      )

      await destroyUserSessions(req.userId, req.sessionID)

      logEvent(db, { event: 'user-update-password', userId: req.userId, ip: req.ip })

      res.json({ status: 'ok' })
    } catch (err) {
      console.error('Change password error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })
}
