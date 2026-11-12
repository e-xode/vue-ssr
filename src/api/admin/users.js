import { requireAuth, requireAdmin } from '../middleware.js';
import { ADMIN_USER_PROJECTION, USER_TYPES } from '#src/shared/const.js';
import { parseObjectId, parsePagination } from '#src/shared/dbHelpers.js';
import { escapeRegex, readString, readTrimmed } from '#src/shared/utils.js';
import { removeAvatarFile } from '#src/api/auth/avatar.js';
import { destroyUserSessions } from '#src/shared/security.js';
import { logEvent } from '#src/shared/logger.js';

async function handleListUsers(req, res, db) {
  try {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 25 });
    const search = readString(req.query.search) || '';

    const pattern = { $regex: escapeRegex(search), $options: 'i' };
    const filter = search ? { $or: [{ name: pattern }, { email: pattern }] } : {};

    const [users, total] = await Promise.all([
      db
        .collection('users')
        .find(filter, { projection: ADMIN_USER_PROJECTION })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('users').countDocuments(filter),
    ]);

    res.json({ users, total, page, limit });
  } catch (err) {
    console.error('Admin list users error:', err);
    res.status(500).json({ error: 'error.server' });
  }
}

async function handleGetUser(req, res, db) {
  const userId = parseObjectId(req.params.userId);
  if (!userId) return res.status(400).json({ error: 'error.invalidId' });
  try {
    const [user, recentLogs] = await Promise.all([
      db.collection('users').findOne({ _id: userId }, { projection: ADMIN_USER_PROJECTION }),
      db.collection('logs').find({ userId }).sort({ createdAt: -1 }).limit(10).toArray(),
    ]);

    if (!user) {
      return res.status(404).json({ error: 'error.auth.userNotFound' });
    }

    res.json({ user, recentLogs });
  } catch (err) {
    console.error('Admin get user error:', err);
    res.status(500).json({ error: 'error.server' });
  }
}

const TARGET_PROJECTION = { type: 1, avatar: 1, loginHistory: { $slice: -1 } };

function userBlockReason(userId) {
  return `user:${userId}`;
}

async function loadModifiableTarget(res, db, userId) {
  const target = await db
    .collection('users')
    .findOne({ _id: userId }, { projection: TARGET_PROJECTION });
  if (!target) {
    res.status(404).json({ error: 'error.auth.userNotFound' });
    return null;
  }
  if (target.type === USER_TYPES.ADMIN) {
    res.status(400).json({ error: 'error.admin.cannotModifyAdmin' });
    return null;
  }
  return target;
}

async function handleUpdateUser(req, res, db) {
  const userId = parseObjectId(req.params.userId);
  if (!userId) return res.status(400).json({ error: 'error.invalidId' });
  try {
    const name = readTrimmed(req.body.name);
    const type = readString(req.body.type);

    const allowedTypes = Object.values(USER_TYPES);
    if (type && !allowedTypes.includes(type)) {
      return res.status(400).json({ error: 'error.admin.invalidUserType' });
    }

    if (type && type !== USER_TYPES.ADMIN && userId.equals(req.userId)) {
      return res.status(400).json({ error: 'error.admin.cannotDemoteSelf' });
    }

    const update = {};
    if (name !== null) update.name = name;
    if (type) update.type = type;
    update.updatedAt = new Date();

    const result = await db
      .collection('users')
      .findOneAndUpdate(
        { _id: userId },
        { $set: update },
        { returnDocument: 'after', projection: ADMIN_USER_PROJECTION }
      );

    if (!result) {
      return res.status(404).json({ error: 'error.auth.userNotFound' });
    }

    logEvent(db, {
      event: 'admin-user-update',
      userId: req.userId,
      ip: req.ip,
      meta: { targetUserId: userId.toString(), changes: update },
    });

    res.json({ user: result });
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ error: 'error.server' });
  }
}

async function blockLastLoginIp(db, userId, target) {
  const ip = target.loginHistory?.at(-1)?.ip;
  if (!ip) return;
  await db
    .collection('blockedIps')
    .updateOne(
      { ip },
      { $set: { ip, blockedAt: new Date(), reason: userBlockReason(userId) } },
      { upsert: true }
    );
}

async function handleBlockUser(req, res, db) {
  const userId = parseObjectId(req.params.userId);
  if (!userId) return res.status(400).json({ error: 'error.invalidId' });
  try {
    const { blockIps } = req.body;

    const target = await loadModifiableTarget(res, db, userId);
    if (!target) return;

    await db
      .collection('users')
      .updateOne({ _id: userId }, { $set: { isBlocked: true, blockedAt: new Date() } });

    if (blockIps) {
      await blockLastLoginIp(db, userId, target);
    }

    await destroyUserSessions(userId);

    logEvent(db, {
      event: 'admin-user-block',
      userId: req.userId,
      ip: req.ip,
      meta: { targetUserId: userId.toString(), blockIps: !!blockIps },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Admin block user error:', err);
    res.status(500).json({ error: 'error.server' });
  }
}

async function handleUnblockUser(req, res, db) {
  const userId = parseObjectId(req.params.userId);
  if (!userId) return res.status(400).json({ error: 'error.invalidId' });
  try {
    const { unblockIps } = req.body;

    await db
      .collection('users')
      .updateOne({ _id: userId }, { $set: { isBlocked: false }, $unset: { blockedAt: '' } });

    if (unblockIps) {
      await db.collection('blockedIps').deleteMany({ reason: userBlockReason(userId) });
    }

    logEvent(db, {
      event: 'admin-user-unblock',
      userId: req.userId,
      ip: req.ip,
      meta: { targetUserId: userId.toString(), unblockIps: !!unblockIps },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Admin unblock user error:', err);
    res.status(500).json({ error: 'error.server' });
  }
}

async function handleDeleteUser(req, res, db) {
  const userId = parseObjectId(req.params.userId);
  if (!userId) return res.status(400).json({ error: 'error.invalidId' });
  try {
    if (userId.equals(req.userId)) {
      return res.status(400).json({ error: 'error.admin.cannotDeleteSelf' });
    }

    const target = await loadModifiableTarget(res, db, userId);
    if (!target) return;

    await destroyUserSessions(userId);
    await db.collection('users').deleteOne({ _id: userId });
    await Promise.all([
      db.collection('blockedIps').deleteMany({ reason: userBlockReason(userId) }),
      db.collection('logs').deleteMany({ userId }),
      removeAvatarFile(target.avatar),
    ]);

    logEvent(db, {
      event: 'admin-user-delete',
      userId: req.userId,
      ip: req.ip,
      meta: { targetUserId: userId.toString() },
    });

    res.json({ status: 'success' });
  } catch (err) {
    console.error('Admin delete user error:', err);
    res.status(500).json({ error: 'error.server' });
  }
}

async function handleListBlockedIps(req, res, db) {
  try {
    const ips = await db.collection('blockedIps').find({}).sort({ blockedAt: -1 }).toArray();
    res.json(ips);
  } catch (err) {
    console.error('Admin list blocked IPs error:', err);
    res.status(500).json({ error: 'error.server' });
  }
}

async function handleBlockIp(req, res, db) {
  try {
    const ip = readString(req.body.ip);
    const reason = readString(req.body.reason);
    if (!ip) return res.status(400).json({ error: 'error.validation' });

    await db
      .collection('blockedIps')
      .updateOne(
        { ip },
        { $set: { ip, blockedAt: new Date(), reason: reason || 'manual' } },
        { upsert: true }
      );

    logEvent(db, {
      event: 'admin-ip-block',
      userId: req.userId,
      ip: req.ip,
      meta: { blockedIp: ip, reason },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Admin block IP error:', err);
    res.status(500).json({ error: 'error.server' });
  }
}

async function handleUnblockIp(req, res, db) {
  try {
    await db.collection('blockedIps').deleteOne({ ip: req.params.ip });

    logEvent(db, {
      event: 'admin-ip-unblock',
      userId: req.userId,
      ip: req.ip,
      meta: { unblockedIp: req.params.ip },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Admin unblock IP error:', err);
    res.status(500).json({ error: 'error.server' });
  }
}

export function setupAdminUsersRoutes(app, db) {
  const adminMiddleware = [requireAuth, requireAdmin];

  app.get('/api/admin/users', ...adminMiddleware, (req, res) => handleListUsers(req, res, db));

  app.get('/api/admin/users/:userId', ...adminMiddleware, (req, res) =>
    handleGetUser(req, res, db)
  );

  app.put('/api/admin/users/:userId', ...adminMiddleware, (req, res) =>
    handleUpdateUser(req, res, db)
  );

  app.put('/api/admin/users/:userId/block', ...adminMiddleware, (req, res) =>
    handleBlockUser(req, res, db)
  );

  app.put('/api/admin/users/:userId/unblock', ...adminMiddleware, (req, res) =>
    handleUnblockUser(req, res, db)
  );

  app.delete('/api/admin/users/:userId', ...adminMiddleware, (req, res) =>
    handleDeleteUser(req, res, db)
  );

  app.get('/api/admin/blocked-ips', ...adminMiddleware, (req, res) =>
    handleListBlockedIps(req, res, db)
  );

  app.post('/api/admin/blocked-ips', ...adminMiddleware, (req, res) => handleBlockIp(req, res, db));

  app.delete('/api/admin/blocked-ips/:ip', ...adminMiddleware, (req, res) =>
    handleUnblockIp(req, res, db)
  );
}
