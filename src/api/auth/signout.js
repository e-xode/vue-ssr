import { parseObjectId } from '#src/shared/dbHelpers.js';
import { SESSION_COOKIE_BASE_OPTIONS, SESSION_COOKIE_NAME } from '#src/shared/const.js';
import { logEvent } from '#src/shared/logger.js';

export function setupSignoutRoute(app, db) {
  app.post('/api/auth/signout', async (req, res) => {
    const userId = parseObjectId(req.session?.userId);
    req.session.destroy((err) => {
      if (err) {
        console.error('Signout error:', err);
        return res.status(500).json({ error: 'error.server' });
      }
      res.clearCookie(SESSION_COOKIE_NAME, {
        ...SESSION_COOKIE_BASE_OPTIONS,
        secure: process.env.NODE_ENV === 'production',
      });
      if (userId) {
        logEvent(db, { event: 'user-signout', userId, ip: req.ip });
      }
      res.json({ status: 'success' });
    });
  });
}
