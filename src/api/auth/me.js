import { USER_SAFE_PROJECTION } from '#src/shared/const.js';
import { resolveSession, SESSION_STATE } from '#src/api/middleware.js';

export function setupMeRoute(app, db) {
  app.get('/api/auth/me', async (req, res) => {
    try {
      const session = await resolveSession(req, db, USER_SAFE_PROJECTION);
      res.json({ user: session.state === SESSION_STATE.ACTIVE ? session.user : null });
    } catch (err) {
      console.error('Me endpoint error:', err);
      res.status(500).json({ error: 'error.server' });
    }
  });
}
