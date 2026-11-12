import { parseObjectId } from '#src/shared/dbHelpers.js';
import { USER_TYPES } from '#src/shared/const.js';
import { destroySession, isSessionExpired } from '#src/shared/security.js';

let _db = null;

const AUTH_PROJECTION = { isBlocked: 1, type: 1 };

export const SESSION_STATE = {
  ANONYMOUS: 'anonymous',
  ENDED: 'ended',
  BLOCKED: 'blocked',
  ACTIVE: 'active',
};

const SESSION_REFUSALS = {
  [SESSION_STATE.ANONYMOUS]: { status: 401, error: 'error.unauthorized' },
  [SESSION_STATE.ENDED]: { status: 401, error: 'error.unauthorized' },
  [SESSION_STATE.BLOCKED]: { status: 403, error: 'error.auth.blocked' },
};

export function setMiddlewareDb(db) {
  _db = db;
}

async function endSession(req, state) {
  await destroySession(req);
  return { state };
}

export async function resolveSession(req, db, projection = AUTH_PROJECTION) {
  const userId = parseObjectId(req.session?.userId);
  if (!userId) return { state: SESSION_STATE.ANONYMOUS };

  if (isSessionExpired(req.session)) return endSession(req, SESSION_STATE.ENDED);

  const user = await db.collection('users').findOne({ _id: userId }, { projection });
  if (!user) return endSession(req, SESSION_STATE.ENDED);
  if (user.isBlocked) return endSession(req, SESSION_STATE.BLOCKED);

  return { state: SESSION_STATE.ACTIVE, userId, user };
}

export async function requireAuth(req, res, next) {
  try {
    const session = await resolveSession(req, _db);
    const refusal = SESSION_REFUSALS[session.state];
    if (refusal) return res.status(refusal.status).json({ error: refusal.error });

    req.userId = session.userId;
    req.authUser = session.user;
    next();
  } catch (err) {
    console.error('Auth check error:', err);
    res.status(503).json({ error: 'error.server' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.authUser) {
    return res.status(401).json({ error: 'error.unauthorized' });
  }
  if (req.authUser.type !== USER_TYPES.ADMIN) {
    return res.status(403).json({ error: 'error.forbidden' });
  }
  next();
}
