import { describe, it, expect, vi } from 'vitest';
import { hashCode } from '#src/shared/email.js';
import { destroyUserSessions, startUserSession } from '#src/shared/security.js';
import { setupChangeEmailRoute } from '#src/api/auth/changeEmail.js';
import {
  callRoute,
  createCollection,
  createDb,
  createReq,
  createRouteApp,
} from '../fixtures/routeHarness.js';

vi.mock('#src/shared/security.js', async (importOriginal) => ({
  ...(await importOriginal()),
  destroyUserSessions: vi.fn(),
  startUserSession: vi.fn(),
}));

const USER_ID = '65f1c2a4b3d4e5f6a7b8c9d0';
const ROUTE = 'POST /api/auth/verify-email-change';

function buildPendingUser(overrides = {}) {
  return {
    _id: USER_ID,
    pendingEmail: 'new@example.com',
    pendingEmailCode: hashCode('123456'),
    pendingEmailCodeExpires: new Date(Date.now() + 60 * 1000),
    ...overrides,
  };
}

function mount({ pending = buildPendingUser(), emailOwner = null, updateOne } = {}) {
  const findOne = vi.fn(async (filter) => (filter.email ? emailOwner : pending));
  const users = createCollection({
    findOne,
    updateOne: updateOne ?? vi.fn().mockResolvedValue({ modifiedCount: 1 }),
  });
  const logs = createCollection({ insertOne: vi.fn().mockResolvedValue({}) });
  const { app, routes } = createRouteApp();
  setupChangeEmailRoute(app, createDb({ users, logs }));
  return { routes, users };
}

function verifyReq(code) {
  return createReq({ body: { code }, userId: USER_ID, session: { createdAt: Date.now() } });
}

describe('api/auth verify-email-change', () => {
  it('confirms the new email with a code pasted with spaces', async () => {
    const { routes, users } = mount();

    const res = await callRoute(routes, ROUTE, verifyReq(' 123456 '));

    expect(res.body).toEqual({ status: 'ok', email: 'new@example.com' });
    const [, update] = users.updateOne.mock.calls.at(-1);
    expect(update.$set).toEqual({ email: 'new@example.com' });
    expect(Object.keys(update.$unset)).toContain('pendingEmailCode');
    expect(destroyUserSessions).toHaveBeenCalled();
    expect(startUserSession).toHaveBeenCalled();
  });

  it('counts a wrong code on its own attempt counter', async () => {
    const { routes, users } = mount({ pending: buildPendingUser({ pendingEmailCodeAttempts: 2 }) });

    const res = await callRoute(routes, ROUTE, verifyReq('000000'));

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'error.auth.invalidCode', attempts: 0 });
    expect(users.updateOne.mock.calls[0][1]).toEqual({ $inc: { pendingEmailCodeAttempts: 1 } });
  });

  it('refuses the right code once the attempt limit is reached', async () => {
    const updateOne = vi.fn().mockResolvedValue({ modifiedCount: 0 });
    const { routes } = mount({ updateOne });

    const res = await callRoute(routes, ROUTE, verifyReq('123456'));

    expect(res.statusCode).toBe(429);
    expect(startUserSession).not.toHaveBeenCalled();
  });

  it('answers 409 when the email was taken between the check and the update', async () => {
    const duplicate = Object.assign(new Error('E11000'), { code: 11000 });
    const updateOne = vi.fn(async (filter, update) => {
      if (update.$set?.email) throw duplicate;
      return { modifiedCount: 1 };
    });
    const { routes } = mount({ updateOne });

    const res = await callRoute(routes, ROUTE, verifyReq('123456'));

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ error: 'error.auth.emailAlreadyUsed' });
    expect(startUserSession).not.toHaveBeenCalled();
  });
});
