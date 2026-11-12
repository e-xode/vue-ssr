import { describe, it, expect, vi } from 'vitest';
import {
  requireAuth,
  requireAdmin,
  resolveSession,
  SESSION_STATE,
  setMiddlewareDb,
} from '#src/api/middleware.js';
import { SESSION_ABSOLUTE_MAX_AGE_MS } from '#src/shared/const.js';
import { createCollection, createDb, createReq, createRes } from '../fixtures/routeHarness.js';

const USER_ID = '65f1c2a4b3d4e5f6a7b8c9d0';

function buildDbWithUser(user) {
  const users = createCollection({ findOne: vi.fn().mockResolvedValue(user) });
  return { db: createDb({ users }), users };
}

function buildSession(overrides = {}) {
  return { userId: USER_ID, createdAt: Date.now(), destroy: vi.fn((done) => done()), ...overrides };
}

describe('api/middleware.js', () => {
  describe('requireAuth', () => {
    it('answers 401 without a session user', async () => {
      const res = createRes();
      const next = vi.fn();

      await requireAuth(createReq({ session: {} }), res, next);

      expect(res.statusCode).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('answers 401 for a malformed session user id', async () => {
      const res = createRes();
      const next = vi.fn();

      await requireAuth(createReq({ session: { userId: 'not-an-id' } }), res, next);

      expect(res.statusCode).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('accepts a valid session and exposes the user', async () => {
      const { db } = buildDbWithUser({ type: 'user' });
      setMiddlewareDb(db);
      const req = createReq({ session: buildSession() });
      const next = vi.fn();

      await requireAuth(req, createRes(), next);

      expect(next).toHaveBeenCalled();
      expect(req.authUser).toEqual({ type: 'user' });
    });

    it('destroys a session older than the absolute lifetime without querying users', async () => {
      const { db, users } = buildDbWithUser({ type: 'user' });
      setMiddlewareDb(db);
      const session = buildSession({ createdAt: Date.now() - SESSION_ABSOLUTE_MAX_AGE_MS - 1000 });
      const res = createRes();
      const next = vi.fn();

      await requireAuth(createReq({ session }), res, next);

      expect(res.statusCode).toBe(401);
      expect(session.destroy).toHaveBeenCalled();
      expect(users.findOne).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('destroys a session that has no creation time', async () => {
      const { db } = buildDbWithUser({ type: 'user' });
      setMiddlewareDb(db);
      const session = buildSession({ createdAt: undefined });
      const res = createRes();

      await requireAuth(createReq({ session }), res, vi.fn());

      expect(res.statusCode).toBe(401);
      expect(session.destroy).toHaveBeenCalled();
    });

    it('destroys the session when the user no longer exists', async () => {
      const { db } = buildDbWithUser(null);
      setMiddlewareDb(db);
      const session = buildSession();
      const res = createRes();
      const next = vi.fn();

      await requireAuth(createReq({ session }), res, next);

      expect(res.statusCode).toBe(401);
      expect(session.destroy).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('destroys the session of a blocked user', async () => {
      const { db } = buildDbWithUser({ isBlocked: true });
      setMiddlewareDb(db);
      const session = buildSession();
      const res = createRes();
      const next = vi.fn();

      await requireAuth(createReq({ session }), res, next);

      expect(res.statusCode).toBe(403);
      expect(session.destroy).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('answers 503 and never continues when the lookup throws', async () => {
      const users = createCollection({ findOne: vi.fn().mockRejectedValue(new Error('boom')) });
      setMiddlewareDb(createDb({ users }));
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const res = createRes();
      const next = vi.fn();

      await requireAuth(createReq({ session: buildSession() }), res, next);

      expect(res.statusCode).toBe(503);
      expect(res.body).toEqual({ error: 'error.server' });
      expect(errorSpy).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('lets an admin loaded by requireAuth through without a second query', async () => {
      const { db, users } = buildDbWithUser({ type: 'admin' });
      setMiddlewareDb(db);
      const req = createReq({ session: buildSession() });
      const next = vi.fn();

      await requireAuth(req, createRes(), vi.fn());
      requireAdmin(req, createRes(), next);

      expect(users.findOne).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalled();
    });

    it('answers 403 for a non-admin user', () => {
      const res = createRes();
      const next = vi.fn();

      requireAdmin(createReq({ authUser: { type: 'user' } }), res, next);

      expect(res.statusCode).toBe(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('answers 401 when requireAuth did not run, whatever the session says', () => {
      const res = createRes();
      const next = vi.fn();

      requireAdmin(createReq({ session: { userId: USER_ID } }), res, next);

      expect(res.statusCode).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('resolveSession', () => {
    it('waits for the session to be destroyed before reporting it ended', async () => {
      const { db } = buildDbWithUser(null);
      const order = [];
      const session = buildSession({
        destroy: vi.fn((done) => {
          setTimeout(() => {
            order.push('destroyed');
            done();
          }, 5);
        }),
      });

      const result = await resolveSession(createReq({ session }), db);
      order.push('resolved');

      expect(result).toEqual({ state: SESSION_STATE.ENDED });
      expect(order).toEqual(['destroyed', 'resolved']);
    });

    it('logs a failed destroy and still ends the session', async () => {
      const { db } = buildDbWithUser({ isBlocked: true });
      const failure = new Error('store down');
      const session = buildSession({ destroy: vi.fn((done) => done(failure)) });

      const result = await resolveSession(createReq({ session }), db);

      expect(result).toEqual({ state: SESSION_STATE.BLOCKED });
      expect(console.error).toHaveBeenCalledWith(failure);
    });

    it('returns the user read with the requested projection', async () => {
      const { db, users } = buildDbWithUser({ type: 'user', name: 'Ada' });
      const projection = { name: 1, type: 1, isBlocked: 1 };

      const result = await resolveSession(createReq({ session: buildSession() }), db, projection);

      expect(result.state).toBe(SESSION_STATE.ACTIVE);
      expect(result.user).toEqual({ type: 'user', name: 'Ada' });
      expect(users.findOne.mock.calls[0][1]).toEqual({ projection });
    });
  });
});
