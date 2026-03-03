import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { requireAuth } from '#src/api/middleware.js'
import { logEvent } from '#src/shared/logger.js'

const AVATAR_DIR = 'public/uploads/avatars'

fs.mkdirSync(AVATAR_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: AVATAR_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${crypto.randomUUID()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    cb(null, allowed.includes(file.mimetype))
  }
})

function deleteFile(filePath) {
  const fullPath = path.join('public', filePath)
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
}

export function setupAvatarRoute(app, db) {
  app.post('/api/auth/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'error.validation' })

      const user = await db.collection('users').findOne({ _id: req.userId }, { projection: { avatar: 1 } })
      if (user?.avatar) deleteFile(user.avatar)

      const avatar = `/uploads/avatars/${req.file.filename}`
      await db.collection('users').updateOne({ _id: req.userId }, { $set: { avatar } })

      logEvent(db, { event: 'user-update-avatar', userId: req.userId, ip: req.ip })

      res.json({ avatar })
    } catch (err) {
      console.error('Upload avatar error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })

  app.delete('/api/auth/avatar', requireAuth, async (req, res) => {
    try {
      const user = await db.collection('users').findOne({ _id: req.userId }, { projection: { avatar: 1 } })
      if (user?.avatar) deleteFile(user.avatar)

      await db.collection('users').updateOne({ _id: req.userId }, { $unset: { avatar: '' } })

      logEvent(db, { event: 'user-delete-avatar', userId: req.userId, ip: req.ip })

      res.json({ status: 'ok' })
    } catch (err) {
      console.error('Delete avatar error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })
}
