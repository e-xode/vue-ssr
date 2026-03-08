import { getUserWithCounts } from '#src/shared/dbHelpers.js'

export function setupMeRoute(app, db) {
  app.get('/api/auth/me', async (req, res) => {
    if (!req.session?.userId) {
      return res.json({ user: null })
    }
    try {
      const user = await getUserWithCounts(db, req.session.userId)
      res.json({ user })
    } catch (err) {
      console.error('Me endpoint error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })
}
