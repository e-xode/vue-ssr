import { createHash, timingSafeEqual } from 'node:crypto';
import { startUserSession } from '#src/shared/security.js';

const TOKEN_HEADER = 'x-dev-login-token';
const MIN_TOKEN_LENGTH = 32;
const DEFAULT_EMAIL = 'qa@e-xode.net';

export function isDevLoginEnabled(env = process.env) {
  return (
    env.NODE_ENV !== 'production' &&
    env.DEV_LOGIN_ENABLED === 'true' &&
    typeof env.DEV_LOGIN_TOKEN === 'string' &&
    env.DEV_LOGIN_TOKEN.length >= MIN_TOKEN_LENGTH
  );
}

export function isValidDevToken(provided, expected) {
  if (typeof provided !== 'string' || typeof expected !== 'string' || !expected) {
    return false;
  }
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

export function setupDevLoginRoute(app, db, env = process.env) {
  if (!isDevLoginEnabled(env)) {
    return;
  }

  const email = (env.DEV_LOGIN_EMAIL || DEFAULT_EMAIL).trim().toLowerCase();

  app.post('/api/dev/login', async (req, res) => {
    if (!isValidDevToken(req.get(TOKEN_HEADER), env.DEV_LOGIN_TOKEN)) {
      return res.status(404).json({ error: 'error.notFound' });
    }

    try {
      const user = await db
        .collection('users')
        .findOne({ email }, { projection: { _id: 1, email: 1, isBlocked: 1 } });

      if (!user) {
        return res.status(404).json({ error: 'error.notFound' });
      }

      if (user.isBlocked) {
        return res.status(403).json({ error: 'error.auth.blocked' });
      }

      await startUserSession(req, user._id.toString());

      return res.json({ ok: true, email: user.email });
    } catch (err) {
      console.error('Dev login error:', err);
      return res.status(500).json({ error: 'error.server' });
    }
  });
}
