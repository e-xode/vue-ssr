import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { requireAuth } from '#src/api/middleware.js';
import { logEvent } from '#src/shared/logger.js';
import {
  AVATAR_MAX_BYTES,
  AVATAR_MIME_EXTENSIONS,
  AVATAR_UPLOAD_ERRORS,
} from '#src/shared/const.js';

const PUBLIC_DIR = 'public';
const AVATAR_DIR = 'public/uploads/avatars';

fs.mkdirSync(AVATAR_DIR, { recursive: true });

const isAllowedMimeType = (mimetype) => Object.hasOwn(AVATAR_MIME_EXTENSIONS, mimetype);

const storage = multer.diskStorage({
  destination: AVATAR_DIR,
  filename: (req, file, cb) => {
    cb(null, `${crypto.randomUUID()}${AVATAR_MIME_EXTENSIONS[file.mimetype]}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: AVATAR_MAX_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (isAllowedMimeType(file.mimetype)) return cb(null, true);
    const err = new Error(`Unsupported avatar mimetype: ${file.mimetype}`);
    err.code = 'LIMIT_UNEXPECTED_TYPE';
    cb(err);
  },
});

export function uploadAvatar(req, res, next) {
  upload.single('avatar')(req, res, (err) => {
    if (!err) return next();
    console.error('Upload avatar error:', err);
    const known = AVATAR_UPLOAD_ERRORS[err.code];
    if (known) return res.status(known.status).json({ error: known.error });
    res.status(500).json({ error: 'error.server' });
  });
}

export function resolveAvatarPath(avatarUrl) {
  if (typeof avatarUrl !== 'string' || !avatarUrl) return null;
  const avatarRoot = path.resolve(AVATAR_DIR) + path.sep;
  const filePath = path.resolve(PUBLIC_DIR, `.${path.posix.sep}${avatarUrl}`);
  return filePath.startsWith(avatarRoot) ? filePath : null;
}

export async function removeAvatarFile(avatarUrl) {
  const filePath = resolveAvatarPath(avatarUrl);
  if (!filePath) return false;
  try {
    await fs.promises.unlink(filePath);
    return true;
  } catch (err) {
    if (err?.code !== 'ENOENT') console.error(err);
    return false;
  }
}

export function setupAvatarRoute(app, db) {
  app.post('/api/auth/avatar', requireAuth, uploadAvatar, async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'error.validation' });

      const user = await db
        .collection('users')
        .findOne({ _id: req.userId }, { projection: { avatar: 1 } });
      await removeAvatarFile(user?.avatar);

      const avatar = `/uploads/avatars/${req.file.filename}`;
      await db.collection('users').updateOne({ _id: req.userId }, { $set: { avatar } });

      logEvent(db, { event: 'user-update-avatar', userId: req.userId, ip: req.ip });

      res.json({ avatar });
    } catch (err) {
      console.error('Upload avatar error:', err);
      res.status(500).json({ error: 'error.server' });
    }
  });

  app.delete('/api/auth/avatar', requireAuth, async (req, res) => {
    try {
      const user = await db
        .collection('users')
        .findOne({ _id: req.userId }, { projection: { avatar: 1 } });
      await removeAvatarFile(user?.avatar);

      await db.collection('users').updateOne({ _id: req.userId }, { $unset: { avatar: '' } });

      logEvent(db, { event: 'user-delete-avatar', userId: req.userId, ip: req.ip });

      res.json({ status: 'ok' });
    } catch (err) {
      console.error('Delete avatar error:', err);
      res.status(500).json({ error: 'error.server' });
    }
  });
}
