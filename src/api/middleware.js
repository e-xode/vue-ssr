import { parseObjectId } from '#src/shared/dbHelpers.js';
import { USER_TYPES } from '#src/shared/const.js';
import { isSessionExpired } from '#src/shared/security.js';

let _db = null;

const AUTH_PROJECTION = { isBlocked: 1, type: 1 };

export function setMiddlewareDb(db) {
  _db = db;
}

function rejectSession(req, res, status, error) {
  req.session.destroy(() => {});
  return res.status(status).json({ error });
}

export async function requireAuth(req, res, next) {
  const userId = parseObjectId(req.session?.userId);
  if (!userId) {
    return res.status(401).json({ error: 'error.unauthorized' });
  }

  if (isSessionExpired(req.session)) {
    return rejectSession(req, res, 401, 'error.unauthorized');
  }

  try {
    const user = await _db
      .collection('users')
      .findOne({ _id: userId }, { projection: AUTH_PROJECTION });
    if (!user) return rejectSession(req, res, 401, 'error.unauthorized');
    if (user.isBlocked) return rejectSession(req, res, 403, 'error.auth.blocked');
    req.userId = userId;
    req.authUser = user;
    next();
  } catch (err) {
    console.error('Auth check error:', err);
    res.status(503).json({ error: 'error.server' });
  }
}

export function requireAdmin(db) {
  return async (req, res, next) => {
    const userId = parseObjectId(req.session?.userId);
    if (!userId) {
      return res.status(401).json({ error: 'error.unauthorized' });
    }
    try {
      const user =
        req.authUser ||
        (await db.collection('users').findOne({ _id: userId }, { projection: AUTH_PROJECTION }));
      if (!user || user.type !== USER_TYPES.ADMIN) {
        return res.status(403).json({ error: 'error.forbidden' });
      }
      req.userId = userId;
      next();
    } catch (err) {
      console.error('Admin check error:', err);
      res.status(503).json({ error: 'error.server' });
    }
  };
}
