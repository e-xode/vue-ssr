import { describe, it, expect, vi } from 'vitest';
import { setupMeRoute } from '#src/api/auth/me.js';
import { SESSION_ABSOLUTE_MAX_AGE_MS, USER_SAFE_PROJECTION } from '#src/shared/const.js';
import {
  callRoute,
  createCollection,
  createDb,
  createReq,
  createRouteApp,
} from '../fixtures/routeHarness.js';

const USER_ID = '65f1c2a4b3d4e5f6a7b8c9d0';
const ROUTE = 'GET /api/auth/me';

function mount(user) {
  const users = createCollection({ findOne: vi.fn().mockResolvedValue(user) });
  const { app, routes } = createRouteApp();
  setupMeRoute(app, createDb({ users }));
  return { routes, users };
}

function buildSession(overrides = {}) {
  return { userId: USER_ID, createdAt: Date.now(), destroy: vi.fn((done) => done()), ...overrides };
}

describe('api/auth/me', () => {
  it('answers a null user without a session and without querying the database', async () => {
    const { routes, users } = mount(null);

    const res = await callRoute(routes, ROUTE, createReq({ session: {} }));

    expect(res.body).toEqual({ user: null });
    expect(users.findOne).not.toHaveBeenCalled();
  });

  it('answers a null user for a malformed session user id', async () => {
    const { routes, users } = mount(null);
    const session = buildSession({ userId: { $ne: null } });

    const res = await callRoute(routes, ROUTE, createReq({ session }));

    expect(res.body).toEqual({ user: null });
    expect(users.findOne).not.toHaveBeenCalled();
  });

  it('returns the user with the safe projection', async () => {
    const user = { _id: USER_ID, email: 'user@example.com' };
    const { routes, users } = mount(user);
    const session = buildSession();

    const res = await callRoute(routes, ROUTE, createReq({ session }));

    expect(res.body).toEqual({ user });
    expect(users.findOne.mock.calls[0][1]).toEqual({ projection: USER_SAFE_PROJECTION });
    expect(session.destroy).not.toHaveBeenCalled();
  });

  it('ends a session older than the absolute lifetime', async () => {
    const { routes, users } = mount({ _id: USER_ID });
    const session = buildSession({ createdAt: Date.now() - SESSION_ABSOLUTE_MAX_AGE_MS - 1000 });

    const res = await callRoute(routes, ROUTE, createReq({ session }));

    expect(res.body).toEqual({ user: null });
    expect(session.destroy).toHaveBeenCalled();
    expect(users.findOne).not.toHaveBeenCalled();
  });

  it('ends the session of a blocked user', async () => {
    const { routes } = mount({ _id: USER_ID, isBlocked: true });
    const session = buildSession();

    const res = await callRoute(routes, ROUTE, createReq({ session }));

    expect(res.body).toEqual({ user: null });
    expect(session.destroy).toHaveBeenCalled();
  });

  it('ends the session of a deleted user', async () => {
    const { routes } = mount(null);
    const session = buildSession();

    const res = await callRoute(routes, ROUTE, createReq({ session }));

    expect(res.body).toEqual({ user: null });
    expect(session.destroy).toHaveBeenCalled();
  });
});
