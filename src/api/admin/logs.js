import { ObjectId } from 'mongodb'
import { requireAuth, requireAdmin } from '../middleware.js'

export function setupAdminLogsRoute(app, db) {
  app.get('/api/admin/logs', requireAuth, requireAdmin(db), async (req, res) => {
    try {
      const { search, event, userId, from, to, page = 1, perPage = 50 } = req.query
      const filter = {}

      if (event) filter.event = event
      if (userId && ObjectId.isValid(userId)) filter.userId = new ObjectId(userId)

      if (from || to) {
        filter.createdAt = {}
        if (from) filter.createdAt.$gte = new Date(from)
        if (to) filter.createdAt.$lte = new Date(to)
      }

      if (search) {
        filter.$or = [
          { event: { $regex: search, $options: 'i' } },
          { ip: { $regex: search, $options: 'i' } },
          { 'meta.email': { $regex: search, $options: 'i' } }
        ]
      }

      const skip = (parseInt(page) - 1) * parseInt(perPage)
      const limit = parseInt(perPage)

      const [logs, total] = await Promise.all([
        db.collection('logs')
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        db.collection('logs').countDocuments(filter)
      ])

      const userIds = [...new Set(logs.filter(l => l.userId).map(l => l.userId.toString()))].map(id => new ObjectId(id))

      let usersMap = {}
      if (userIds.length) {
        const users = await db.collection('users').find(
          { _id: { $in: userIds } },
          { projection: { name: 1, email: 1 } }
        ).toArray()
        usersMap = Object.fromEntries(users.map(u => [u._id.toString(), { name: u.name, email: u.email }]))
      }

      const enriched = logs.map(log => ({
        ...log,
        user: log.userId ? usersMap[log.userId.toString()] || null : null
      }))

      res.json({ logs: enriched, total, page: parseInt(page), perPage: limit })
    } catch (err) {
      console.error('Admin logs list error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })

  app.get('/api/admin/logs/events', requireAuth, requireAdmin(db), async (req, res) => {
    try {
      const events = await db.collection('logs').distinct('event')
      res.json(events.sort())
    } catch (err) {
      console.error('Admin logs events error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })

  app.delete('/api/admin/logs/:id', requireAuth, requireAdmin(db), async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'error.invalidId' })
    try {
      await db.collection('logs').deleteOne({ _id: new ObjectId(req.params.id) })
      res.json({ success: true })
    } catch (err) {
      console.error('Admin log delete error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })

  app.delete('/api/admin/logs', requireAuth, requireAdmin(db), async (req, res) => {
    try {
      const { ids } = req.body
      if (!ids?.length) return res.status(400).json({ error: 'error.validation' })
      const objectIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id))
      await db.collection('logs').deleteMany({ _id: { $in: objectIds } })
      res.json({ success: true })
    } catch (err) {
      console.error('Admin logs bulk delete error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })
}
