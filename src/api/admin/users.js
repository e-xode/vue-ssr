import { ObjectId } from 'mongodb'
import { requireAuth, requireAdmin } from '../middleware.js'
import { USER_TYPES } from '#src/shared/const.js'

export function setupAdminUsersRoutes(app, db) {
  const adminMiddleware = [requireAuth, requireAdmin(db)]

  app.get('/api/admin/users', ...adminMiddleware, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 25
      const skip = (page - 1) * limit
      const search = req.query.search || ''

      const filter = search
        ? {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } }
            ]
          }
        : {}

      const [users, total] = await Promise.all([
        db
          .collection('users')
          .find(filter, { projection: { password: 0, securityCode: 0, securityCodeExpires: 0 } })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        db.collection('users').countDocuments(filter)
      ])

      res.json({ users, total, page, limit })
    } catch (err) {
      console.error('Admin list users error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })

  app.get('/api/admin/users/:userId', ...adminMiddleware, async (req, res) => {
    try {
      const userId = new ObjectId(req.params.userId)
      const user = await db.collection('users').findOne(
        { _id: userId },
        { projection: { password: 0, securityCode: 0, securityCodeExpires: 0 } }
      )

      if (!user) {
        return res.status(404).json({ error: 'error.auth.userNotFound' })
      }

      res.json({ user })
    } catch (err) {
      console.error('Admin get user error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })

  app.put('/api/admin/users/:userId', ...adminMiddleware, async (req, res) => {
    try {
      const userId = new ObjectId(req.params.userId)
      const { name, type } = req.body

      const allowedTypes = Object.values(USER_TYPES)
      if (type && !allowedTypes.includes(type)) {
        return res.status(400).json({ error: 'error.admin.invalidUserType' })
      }

      const update = {}
      if (name) update.name = name
      if (type) update.type = type
      update.updatedAt = new Date()

      const result = await db.collection('users').findOneAndUpdate(
        { _id: userId },
        { $set: update },
        { returnDocument: 'after', projection: { password: 0, securityCode: 0, securityCodeExpires: 0 } }
      )

      if (!result) {
        return res.status(404).json({ error: 'error.auth.userNotFound' })
      }

      res.json({ user: result })
    } catch (err) {
      console.error('Admin update user error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })

  app.delete('/api/admin/users/:userId', ...adminMiddleware, async (req, res) => {
    try {
      const userId = new ObjectId(req.params.userId)

      if (userId.equals(req.userId)) {
        return res.status(400).json({ error: 'error.admin.cannotDeleteSelf' })
      }

      const result = await db.collection('users').deleteOne({ _id: userId })

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'error.auth.userNotFound' })
      }

      res.json({ status: 'success' })
    } catch (err) {
      console.error('Admin delete user error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })
}
