import { ObjectId } from 'mongodb'

export function setupMeRoute(app, db) {
  app.get('/api/auth/me', async (req, res) => {
    if (!req.session?.userId) {
      return res.json({ user: null })
    }
    try {
      const userId = new ObjectId(req.session.userId)
      const user = await db.collection('users').findOne(
        { _id: userId },
        { projection: { password: 0 } }
      )

      res.json({ user })
    } catch (err) {
      res.status(500).json({ error: 'error.server' })
    }
  })
}
