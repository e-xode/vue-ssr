import { describe, it, expect, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { SECURITY_CODE_EXPIRY_MS } from '#src/shared/const.js';
import { hashCode, sendSecurityCodeEmail, sendResetPasswordEmail } from '#src/shared/email.js';
import { destroyUserSessions } from '#src/shared/security.js';
import { setupVerifyCodeRoute } from '#src/api/auth/verifyCode.js';
import { setupResendCodeRoute } from '#src/api/auth/resendCode.js';
import { setupResetPasswordRoute } from '#src/api/auth/resetPassword.js';
import { setupForgotPasswordRoute } from '#src/api/auth/forgotPassword.js';
import { setupSigninRoute } from '#src/api/auth/signin.js';
import { setupSignupRoute } from '#src/api/auth/signup.js';
import { setupChangePasswordRoute } from '#src/api/auth/changePassword.js';
import {
  callRoute,
  createCollection,
  createDb,
  createReq,
  createRouteApp,
} from '../fixtures/routeHarness.js';

vi.mock('bcryptjs', () => ({ default: { hash: vi.fn(), compare: vi.fn() } }));

vi.mock('#src/shared/email.js', async (importOriginal) => ({
  ...(await importOriginal()),
  sendSecurityCodeEmail: vi.fn(),
  sendResetPasswordEmail: vi.fn(),
}));

vi.mock('#src/shared/security.js', async (importOriginal) => ({
  ...(await importOriginal()),
  destroyUserSessions: vi.fn(),
}));

const USER_ID = '65f1c2a4b3d4e5f6a7b8c9d0';

function buildUser(overrides = {}) {
  return {
    _id: USER_ID,
    email: 'user@example.com',
    password: 'hash',
    securityCode: hashCode('123456'),
    securityCodeExpires: new Date(Date.now() + 60 * 1000),
    ...overrides,
  };
}

function buildDb({ user = null, blockedIp = null } = {}) {
  const users = createCollection({ findOne: vi.fn().mockResolvedValue(user) });
  const blockedIps = createCollection({ findOne: vi.fn().mockResolvedValue(blockedIp) });
  const logs = createCollection({ insertOne: vi.fn().mockResolvedValue({}) });
  return { db: createDb({ users, blockedIps, logs }), users };
}

function buildSession() {
  const calls = [];
  const session = {
    calls,
    regenerate: vi.fn((cb) => {
      calls.push('regenerate');
      delete session.userId;
      cb();
    }),
    save: vi.fn((cb) => {
      calls.push('save');
      cb();
    }),
  };
  return session;
}

function mountRoute(setup, db) {
  const { app, routes } = createRouteApp();
  setup(app, db);
  return routes;
}

describe('api/auth typed inputs', () => {
  it('rejects an operator object as the verify-code email without querying users', async () => {
    const { db, users } = buildDb();
    const routes = mountRoute(setupVerifyCodeRoute, db);
    const req = createReq({ body: { email: { $ne: null }, code: '123456' } });

    const res = await callRoute(routes, 'POST /api/auth/verify-code', req);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'error.auth.emailAndCodeRequired' });
    expect(users.findOne).not.toHaveBeenCalled();
  });

  it('rejects a non-string verify-code code', async () => {
    const { db, users } = buildDb();
    const routes = mountRoute(setupVerifyCodeRoute, db);
    const req = createReq({ body: { email: 'user@example.com', code: { $gt: '' } } });

    const res = await callRoute(routes, 'POST /api/auth/verify-code', req);

    expect(res.statusCode).toBe(400);
    expect(users.findOne).not.toHaveBeenCalled();
  });

  it('rejects an operator object as the forgot-password email', async () => {
    const { db, users } = buildDb();
    const routes = mountRoute(setupForgotPasswordRoute, db);
    const req = createReq({ body: { email: { $regex: '.*' } } });

    const res = await callRoute(routes, 'POST /api/auth/forgot-password', req);

    expect(res.statusCode).toBe(400);
    expect(users.findOne).not.toHaveBeenCalled();
  });

  it('rejects an operator object as the reset-password email', async () => {
    const { db, users } = buildDb();
    const routes = mountRoute(setupResetPasswordRoute, db);
    const req = createReq({
      body: { email: { $ne: null }, code: '123456', password: 'password1' },
    });

    const res = await callRoute(routes, 'POST /api/auth/reset-password', req);

    expect(res.statusCode).toBe(400);
    expect(users.findOne).not.toHaveBeenCalled();
  });

  it('rejects an operator object as the signin email', async () => {
    const { db, users } = buildDb();
    const routes = mountRoute(setupSigninRoute, db);
    const req = createReq({ body: { email: { $ne: null }, password: 'password1' } });

    const res = await callRoute(routes, 'POST /api/auth/signin', req);

    expect(res.statusCode).toBe(400);
    expect(users.findOne).not.toHaveBeenCalled();
  });

  it('rejects an operator object as the signup name', async () => {
    const { db, users } = buildDb();
    const routes = mountRoute(setupSignupRoute, db);
    const req = createReq({
      body: { email: 'user@example.com', password: 'password1', name: { $ne: null } },
    });

    const res = await callRoute(routes, 'POST /api/auth/signup', req);

    expect(res.statusCode).toBe(400);
    expect(users.findOne).not.toHaveBeenCalled();
  });

  it('rejects an object as the change-password current password', async () => {
    const { db, users } = buildDb();
    const routes = mountRoute(setupChangePasswordRoute, db);
    const req = createReq({ body: { currentPassword: { $ne: null }, newPassword: 'password1' } });

    const res = await callRoute(routes, 'POST /api/auth/change-password', req);

    expect(res.statusCode).toBe(400);
    expect(users.findOne).not.toHaveBeenCalled();
  });
});

describe('api/auth verify-code session', () => {
  it('regenerates the session id before storing the user', async () => {
    const user = buildUser();
    const { db } = buildDb({ user });
    const routes = mountRoute(setupVerifyCodeRoute, db);
    const session = buildSession();
    const req = createReq({ body: { email: 'User@Example.com', code: '123456' }, session });

    const res = await callRoute(routes, 'POST /api/auth/verify-code', req);

    expect(res.body.status).toBe('verified');
    expect(session.calls).toEqual(['regenerate', 'save']);
    expect(session.userId).toBe(USER_ID);
  });

  it('refuses a blocked IP before looking the user up', async () => {
    const { db, users } = buildDb({ user: buildUser(), blockedIp: { ip: '203.0.113.7' } });
    const routes = mountRoute(setupVerifyCodeRoute, db);
    const req = createReq({
      body: { email: 'user@example.com', code: '123456' },
      session: buildSession(),
    });

    const res = await callRoute(routes, 'POST /api/auth/verify-code', req);

    expect(res.statusCode).toBe(403);
    expect(users.findOne).not.toHaveBeenCalled();
  });
});

describe('api/auth reset-password', () => {
  it('destroys every session of the user once the password is reset', async () => {
    const user = buildUser({ resetPasswordPending: true });
    const { db } = buildDb({ user });
    const routes = mountRoute(setupResetPasswordRoute, db);
    vi.mocked(bcrypt.hash).mockResolvedValue('new-hash');
    const req = createReq({
      body: { email: 'user@example.com', code: '123456', password: 'password1' },
    });

    const res = await callRoute(routes, 'POST /api/auth/reset-password', req);

    expect(bcrypt.hash).toHaveBeenCalled();
    expect(res.body).toEqual({ status: 'ok' });
    expect(destroyUserSessions).toHaveBeenCalledWith(USER_ID);
  });

  it('refuses a blocked IP', async () => {
    const { db } = buildDb({ blockedIp: { ip: '203.0.113.7' } });
    const routes = mountRoute(setupResetPasswordRoute, db);
    const req = createReq({
      body: { email: 'user@example.com', code: '123456', password: 'password1' },
    });

    const res = await callRoute(routes, 'POST /api/auth/reset-password', req);

    expect(res.statusCode).toBe(403);
    expect(destroyUserSessions).not.toHaveBeenCalled();
  });
});

describe('api/auth resend-code', () => {
  it('answers the generic response for an unknown email', async () => {
    const { db } = buildDb({ user: null });
    const routes = mountRoute(setupResendCodeRoute, db);
    const req = createReq({ body: { email: 'ghost@example.com' } });

    const res = await callRoute(routes, 'POST /api/auth/resend-code', req);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'code_sent', email: 'ghost@example.com' });
    expect(sendSecurityCodeEmail).not.toHaveBeenCalled();
  });

  it('refuses a blocked user', async () => {
    const { db } = buildDb({ user: buildUser({ isBlocked: true }) });
    const routes = mountRoute(setupResendCodeRoute, db);
    const req = createReq({ body: { email: 'user@example.com' } });

    const res = await callRoute(routes, 'POST /api/auth/resend-code', req);

    expect(res.statusCode).toBe(403);
    expect(sendSecurityCodeEmail).not.toHaveBeenCalled();
  });

  it('passes the request locale to the email builder', async () => {
    const expired = new Date(Date.now() - 60 * 1000);
    const { db } = buildDb({ user: buildUser({ securityCodeExpires: expired }) });
    vi.mocked(sendSecurityCodeEmail).mockResolvedValue({ success: true });
    const routes = mountRoute(setupResendCodeRoute, db);
    const req = createReq({ body: { email: 'user@example.com', locale: 'fr' } });

    await callRoute(routes, 'POST /api/auth/resend-code', req);

    expect(sendSecurityCodeEmail).toHaveBeenCalledWith(
      'user@example.com',
      expect.any(String),
      'fr'
    );
  });

  it('answers 502 when the email could not be sent', async () => {
    const expired = new Date(Date.now() - 60 * 1000);
    const { db } = buildDb({ user: buildUser({ securityCodeExpires: expired }) });
    vi.mocked(sendSecurityCodeEmail).mockResolvedValue({ success: false, error: 'smtp down' });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const routes = mountRoute(setupResendCodeRoute, db);
    const req = createReq({ body: { email: 'user@example.com' } });

    const res = await callRoute(routes, 'POST /api/auth/resend-code', req);

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ error: 'error.emailFailed' });
  });
});

describe('api/auth forgot-password', () => {
  it('refuses a blocked IP', async () => {
    const { db } = buildDb({ blockedIp: { ip: '203.0.113.7' } });
    const routes = mountRoute(setupForgotPasswordRoute, db);
    const req = createReq({ body: { email: 'user@example.com' } });

    const res = await callRoute(routes, 'POST /api/auth/forgot-password', req);

    expect(res.statusCode).toBe(403);
    expect(sendResetPasswordEmail).not.toHaveBeenCalled();
  });

  it('answers sent without issuing a new code inside the cooldown window', async () => {
    const user = buildUser({
      resetPasswordPending: true,
      securityCodeExpires: new Date(Date.now() + SECURITY_CODE_EXPIRY_MS),
    });
    const { db, users } = buildDb({ user });
    users.updateOne = vi.fn();
    const routes = mountRoute(setupForgotPasswordRoute, db);
    const req = createReq({ body: { email: 'user@example.com' } });

    const res = await callRoute(routes, 'POST /api/auth/forgot-password', req);

    expect(res.body).toEqual({ status: 'sent' });
    expect(users.updateOne).not.toHaveBeenCalled();
    expect(sendResetPasswordEmail).not.toHaveBeenCalled();
  });

  it('does not report success when the email failed', async () => {
    const { db } = buildDb({ user: buildUser() });
    vi.mocked(sendResetPasswordEmail).mockResolvedValue({ success: false, error: 'smtp down' });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const routes = mountRoute(setupForgotPasswordRoute, db);
    const req = createReq({ body: { email: 'user@example.com' } });

    const res = await callRoute(routes, 'POST /api/auth/forgot-password', req);

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ error: 'error.emailFailed' });
  });
});

describe('api/auth signin', () => {
  it('passes the request locale and answers 502 when the email failed', async () => {
    const { db } = buildDb({ user: buildUser() });
    vi.mocked(bcrypt.compare).mockResolvedValue(true);
    vi.mocked(sendSecurityCodeEmail).mockResolvedValue({ success: false, error: 'smtp down' });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const routes = mountRoute(setupSigninRoute, db);
    const req = createReq({
      body: { email: 'user@example.com', password: 'password1', locale: 'fr' },
    });

    const res = await callRoute(routes, 'POST /api/auth/signin', req);

    expect(sendSecurityCodeEmail).toHaveBeenCalledWith(
      'user@example.com',
      expect.any(String),
      'fr'
    );
    expect(res.statusCode).toBe(502);
  });
});
