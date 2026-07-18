import { ObjectId } from 'mongodb';
import { requireAuth, requireAdmin } from '../middleware.js';
import { USER_TYPES } from '#src/shared/const.js';
import { destroyUserSessions } from '#src/shared/security.js';
import { logEvent } from '#src/shared/logger.js';

async function handleListUsers(req, res, db) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      db
        .collection('users')
        .find(filter, { projection: { password: 0, securityCode: 0, securityCodeExpires: 0 } })
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
  if (!ObjectId.isValid(req.params.userId))
    return res.status(400).json({ error: 'error.invalidId' });
  try {
    const userId = new ObjectId(req.params.userId);
    const [user, recentLogs] = await Promise.all([
      db
        .collection('users')
        .findOne(
          { _id: userId },
          { projection: { password: 0, securityCode: 0, securityCodeExpires: 0 } }
        ),
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

async function handleUpdateUser(req, res, db) {
  if (!ObjectId.isValid(req.params.userId))
    return res.status(400).json({ error: 'error.invalidId' });
  try {
    const userId = new ObjectId(req.params.userId);
    const { name, type } = req.body;

    const allowedTypes = Object.values(USER_TYPES);
    if (type && !allowedTypes.includes(type)) {
      return res.status(400).json({ error: 'error.admin.invalidUserType' });
    }

    const update = {};
    if (name !== undefined) update.name = name;
    if (type) update.type = type;
    update.updatedAt = new Date();

    const result = await db.collection('users').findOneAndUpdate(
      { _id: userId },
      { $set: update },
      {
        returnDocument: 'after',
        projection: { password: 0, securityCode: 0, securityCodeExpires: 0 },
      }
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

async function blockUserLoginIps(db, userId) {
  const user = await db
    .collection('users')
    .findOne({ _id: userId }, { projection: { loginHistory: 1 } });
  const ips = [...new Set((user?.loginHistory || []).map((h) => h.ip))];
  if (ips.length > 0) {
    const ops = ips.map((ip) => ({
      updateOne: {
        filter: { ip },
        update: { $set: { ip, blockedAt: new Date(), reason: `user:${userId}` } },
        upsert: true,
      },
    }));
    await db.collection('blockedIps').bulkWrite(ops);
  }
}

async function handleBlockUser(req, res, db) {
  if (!ObjectId.isValid(req.params.userId))
    return res.status(400).json({ error: 'error.invalidId' });
  try {
    const userId = new ObjectId(req.params.userId);
    const { blockIps } = req.body;

    await db
      .collection('users')
      .updateOne({ _id: userId }, { $set: { isBlocked: true, blockedAt: new Date() } });

    if (blockIps) {
      await blockUserLoginIps(db, userId);
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
  if (!ObjectId.isValid(req.params.userId))
    return res.status(400).json({ error: 'error.invalidId' });
  try {
    const userId = new ObjectId(req.params.userId);
    const { unblockIps } = req.body;

    await db
      .collection('users')
      .updateOne({ _id: userId }, { $set: { isBlocked: false }, $unset: { blockedAt: '' } });

    if (unblockIps) {
      await db.collection('blockedIps').deleteMany({ reason: `user:${userId}` });
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
  if (!ObjectId.isValid(req.params.userId))
    return res.status(400).json({ error: 'error.invalidId' });
  try {
    const userId = new ObjectId(req.params.userId);

    if (userId.equals(req.userId)) {
      return res.status(400).json({ error: 'error.admin.cannotDeleteSelf' });
    }

    const result = await db.collection('users').deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'error.auth.userNotFound' });
    }

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
    const { ip, reason } = req.body;
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
  const adminMiddleware = [requireAuth, requireAdmin(db)];

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
