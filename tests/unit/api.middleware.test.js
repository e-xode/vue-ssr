import { describe, it, expect, vi } from 'vitest';
import { requireAuth, requireAdmin, setMiddlewareDb } from '#src/api/middleware.js';
import { SESSION_ABSOLUTE_MAX_AGE_MS } from '#src/shared/const.js';
import { createCollection, createDb, createReq, createRes } from '../fixtures/routeHarness.js';

const USER_ID = '65f1c2a4b3d4e5f6a7b8c9d0';

function buildDbWithUser(user) {
  const users = createCollection({ findOne: vi.fn().mockResolvedValue(user) });
  return { db: createDb({ users }), users };
}

function buildSession(overrides = {}) {
  return { userId: USER_ID, createdAt: Date.now(), destroy: vi.fn(), ...overrides };
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
    it('reuses the user loaded by requireAuth without a second query', async () => {
      const { db, users } = buildDbWithUser({ type: 'admin' });
      setMiddlewareDb(db);
      const req = createReq({ session: buildSession() });
      const next = vi.fn();

      await requireAuth(req, createRes(), vi.fn());
      await requireAdmin(db)(req, createRes(), next);

      expect(users.findOne).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalled();
    });

    it('queries the user itself when requireAuth did not run', async () => {
      const { db, users } = buildDbWithUser({ type: 'admin' });
      const next = vi.fn();

      await requireAdmin(db)(createReq({ session: { userId: USER_ID } }), createRes(), next);

      expect(users.findOne).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalled();
    });

    it('answers 403 for a non-admin user', async () => {
      const { db } = buildDbWithUser({ type: 'user' });
      const res = createRes();
      const next = vi.fn();

      await requireAdmin(db)(createReq({ session: { userId: USER_ID } }), res, next);

      expect(res.statusCode).toBe(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('answers 401 for a malformed session user id', async () => {
      const { db } = buildDbWithUser({ type: 'admin' });
      const res = createRes();

      await requireAdmin(db)(createReq({ session: { userId: 'nope' } }), res, vi.fn());

      expect(res.statusCode).toBe(401);
    });

    it('logs and answers 503 when the lookup throws', async () => {
      const users = createCollection({ findOne: vi.fn().mockRejectedValue(new Error('boom')) });
      const db = createDb({ users });
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const res = createRes();
      const next = vi.fn();

      await requireAdmin(db)(createReq({ session: { userId: USER_ID } }), res, next);

      expect(res.statusCode).toBe(503);
      expect(errorSpy).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });
});
