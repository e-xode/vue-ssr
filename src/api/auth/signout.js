import { logEvent } from '#src/shared/logger.js'

export function setupSignoutRoute(app, db) {
  app.post('/api/auth/signout', async (req, res) => {
    const userId = req.session?.userId
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'error.server' })
      }
      res.clearCookie('app.sid')
      if (userId) {
        logEvent(db, { event: 'user-signout', userId, ip: req.ip })
      }
      res.json({ status: 'success' })
    })
  })
}
