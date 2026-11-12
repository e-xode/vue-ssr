import { describe, it, expect, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import {
  CODE_LOCKOUT_MAX_FAILURES,
  SECURITY_CODE_EXPIRY_MS,
  SECURITY_CODE_MAX_ATTEMPTS,
  SECURITY_CODE_PURPOSES,
} from '#src/shared/const.js';
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
    securityCodePurpose: SECURITY_CODE_PURPOSES.LOGIN,
    ...overrides,
  };
}

function buildResetUser(overrides = {}) {
  return buildUser({ securityCodePurpose: SECURITY_CODE_PURPOSES.RESET_PASSWORD, ...overrides });
}

function buildDb({ user = null, blockedIp = null } = {}) {
  const users = createCollection({
    findOne: vi.fn().mockResolvedValue(user),
    findOneAndUpdate: vi.fn().mockResolvedValue(user),
  });
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

  it('counts a wrong code with a conditional increment and reports the attempts left', async () => {
    const { db, users } = buildDb({ user: buildUser({ securityCodeAttempts: 1 }) });
    users.updateOne = vi.fn().mockResolvedValue({ modifiedCount: 1 });
    const routes = mountRoute(setupVerifyCodeRoute, db);
    const req = createReq({
      body: { email: 'user@example.com', code: '000000' },
      session: buildSession(),
    });

    const res = await callRoute(routes, 'POST /api/auth/verify-code', req);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'error.auth.invalidCode', attempts: 1 });
    expect(users.updateOne.mock.calls[0][1]).toEqual({ $inc: { securityCodeAttempts: 1 } });
    expect(Array.isArray(users.updateOne.mock.calls[1][1])).toBe(true);
  });

  it('accepts a code pasted with surrounding spaces', async () => {
    const { db } = buildDb({ user: buildUser() });
    const routes = mountRoute(setupVerifyCodeRoute, db);
    const req = createReq({
      body: { email: 'user@example.com', code: ' 123456 ' },
      session: buildSession(),
    });

    const res = await callRoute(routes, 'POST /api/auth/verify-code', req);

    expect(res.body.status).toBe('verified');
  });

  it('answers an unknown email exactly like a wrong code', async () => {
    const { db } = buildDb({ user: null });
    const routes = mountRoute(setupVerifyCodeRoute, db);
    const req = createReq({ body: { email: 'nobody@example.com', code: '123456' } });

    const res = await callRoute(routes, 'POST /api/auth/verify-code', req);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'error.auth.invalidCode' });
  });

  it('refuses a password-reset code as a login code', async () => {
    const { db } = buildDb({ user: buildResetUser() });
    const routes = mountRoute(setupVerifyCodeRoute, db);
    const session = buildSession();
    const req = createReq({ body: { email: 'user@example.com', code: '123456' }, session });

    const res = await callRoute(routes, 'POST /api/auth/verify-code', req);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'error.auth.invalidCode' });
    expect(session.regenerate).not.toHaveBeenCalled();
  });

  it('refuses the right code while the account is locked after repeated failures', async () => {
    const locked = buildUser({
      codeFailures: CODE_LOCKOUT_MAX_FAILURES,
      codeFailuresSince: new Date(Date.now() - 60 * 1000),
    });
    const { db, users } = buildDb({ user: locked });
    users.updateOne = vi.fn().mockResolvedValue({ modifiedCount: 1 });
    const routes = mountRoute(setupVerifyCodeRoute, db);
    const session = buildSession();
    const req = createReq({ body: { email: 'user@example.com', code: '123456' }, session });

    const res = await callRoute(routes, 'POST /api/auth/verify-code', req);

    expect(res.statusCode).toBe(429);
    expect(users.updateOne).not.toHaveBeenCalled();
    expect(session.regenerate).not.toHaveBeenCalled();
  });

  it('grants only the allowed number of attempts to concurrent requests', async () => {
    const state = { attempts: 0 };
    const { db, users } = buildDb({ user: buildUser() });
    users.updateOne = vi.fn(async (filter, update) => {
      if (!update.$inc?.securityCodeAttempts) return { modifiedCount: 1 };
      if (state.attempts >= filter.securityCodeAttempts.$not.$gte) return { modifiedCount: 0 };
      state.attempts += 1;
      return { modifiedCount: 1 };
    });
    const routes = mountRoute(setupVerifyCodeRoute, db);
    const attempt = () =>
      callRoute(
        routes,
        'POST /api/auth/verify-code',
        createReq({ body: { email: 'user@example.com', code: '000000' }, session: buildSession() })
      );

    const responses = await Promise.all(Array.from({ length: 10 }, attempt));

    const statuses = responses.map((res) => res.statusCode);
    expect(statuses.filter((status) => status === 401)).toHaveLength(SECURITY_CODE_MAX_ATTEMPTS);
    expect(statuses.filter((status) => status === 429)).toHaveLength(
      10 - SECURITY_CODE_MAX_ATTEMPTS
    );
  });

  it('refuses even the right code once the attempt limit is reached', async () => {
    const { db, users } = buildDb({ user: buildUser() });
    users.updateOne = vi.fn().mockResolvedValue({ modifiedCount: 0 });
    const routes = mountRoute(setupVerifyCodeRoute, db);
    const session = buildSession();
    const req = createReq({ body: { email: 'user@example.com', code: '123456' }, session });

    const res = await callRoute(routes, 'POST /api/auth/verify-code', req);

    expect(res.statusCode).toBe(429);
    expect(res.body).toEqual({ error: 'error.auth.tooManyAttempts' });
    expect(session.regenerate).not.toHaveBeenCalled();
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
    const user = buildResetUser();
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

  it('refuses the right code once the attempt limit is reached', async () => {
    const { db, users } = buildDb({ user: buildResetUser() });
    users.updateOne = vi.fn().mockResolvedValue({ modifiedCount: 0 });
    const routes = mountRoute(setupResetPasswordRoute, db);
    const req = createReq({
      body: { email: 'user@example.com', code: '123456', password: 'password1' },
    });

    const res = await callRoute(routes, 'POST /api/auth/reset-password', req);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'error.auth.tooManyAttempts' });
    expect(destroyUserSessions).not.toHaveBeenCalled();
  });

  it('refuses a login code as a password-reset code', async () => {
    const { db } = buildDb({ user: buildUser() });
    const routes = mountRoute(setupResetPasswordRoute, db);
    const req = createReq({
      body: { email: 'user@example.com', code: '123456', password: 'password1' },
    });

    const res = await callRoute(routes, 'POST /api/auth/reset-password', req);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'error.auth.invalidResetRequest' });
    expect(destroyUserSessions).not.toHaveBeenCalled();
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

  it('resends a pending password-reset code with the reset email and purpose', async () => {
    const expired = new Date(Date.now() - 60 * 1000);
    const { db, users } = buildDb({ user: buildResetUser({ securityCodeExpires: expired }) });
    users.updateOne = vi.fn().mockResolvedValue({ modifiedCount: 1 });
    vi.mocked(sendResetPasswordEmail).mockResolvedValue({ success: true });
    const routes = mountRoute(setupResendCodeRoute, db);
    const req = createReq({ body: { email: 'user@example.com' } });

    const res = await callRoute(routes, 'POST /api/auth/resend-code', req);

    expect(res.body.status).toBe('code_sent');
    expect(sendResetPasswordEmail).toHaveBeenCalled();
    expect(sendSecurityCodeEmail).not.toHaveBeenCalled();
    expect(users.updateOne.mock.calls[0][1].$set.securityCodePurpose).toBe(
      SECURITY_CODE_PURPOSES.RESET_PASSWORD
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

  it('answers sent for a blocked account without sending anything', async () => {
    const { db, users } = buildDb({ user: buildUser({ isBlocked: true }) });
    users.updateOne = vi.fn();
    const routes = mountRoute(setupForgotPasswordRoute, db);
    const req = createReq({ body: { email: 'user@example.com' } });

    const res = await callRoute(routes, 'POST /api/auth/forgot-password', req);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'sent' });
    expect(users.updateOne).not.toHaveBeenCalled();
    expect(sendResetPasswordEmail).not.toHaveBeenCalled();
  });

  it('issues a code that only the reset route accepts', async () => {
    const { db, users } = buildDb({ user: buildUser({ securityCode: undefined }) });
    users.updateOne = vi.fn().mockResolvedValue({ modifiedCount: 1 });
    vi.mocked(sendResetPasswordEmail).mockResolvedValue({ success: true });
    const routes = mountRoute(setupForgotPasswordRoute, db);
    const req = createReq({ body: { email: 'user@example.com' } });

    await callRoute(routes, 'POST /api/auth/forgot-password', req);

    expect(users.updateOne.mock.calls[0][1].$set.securityCodePurpose).toBe(
      SECURITY_CODE_PURPOSES.RESET_PASSWORD
    );
  });

  it('answers sent without issuing a new code inside the cooldown window', async () => {
    const user = buildResetUser({
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

describe('api/auth signup', () => {
  const body = { email: 'new@example.com', password: 'password1', name: '  Ada Lovelace  ' };

  it('stores the trimmed name and a login code', async () => {
    const { db, users } = buildDb();
    users.insertOne = vi.fn().mockResolvedValue({});
    vi.mocked(bcrypt.hash).mockResolvedValue('hash');
    vi.mocked(sendSecurityCodeEmail).mockResolvedValue({ success: true });
    const routes = mountRoute(setupSignupRoute, db);

    const res = await callRoute(routes, 'POST /api/auth/signup', createReq({ body }));

    expect(res.body.status).toBe('verification_pending');
    const stored = users.insertOne.mock.calls[0][0];
    expect(stored.name).toBe('Ada Lovelace');
    expect(stored.securityCodePurpose).toBe(SECURITY_CODE_PURPOSES.LOGIN);
  });

  it('answers a duplicate-key race like the email pre-check', async () => {
    const { db, users } = buildDb();
    const duplicate = Object.assign(new Error('E11000'), { code: 11000 });
    users.insertOne = vi.fn().mockRejectedValue(duplicate);
    vi.mocked(bcrypt.hash).mockResolvedValue('hash');
    const routes = mountRoute(setupSignupRoute, db);

    const res = await callRoute(routes, 'POST /api/auth/signup', createReq({ body }));

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'error.auth.emailAlreadyUsed' });
    expect(sendSecurityCodeEmail).not.toHaveBeenCalled();
  });
});

describe('api/auth signin', () => {
  it('issues a login code, replacing a pending reset', async () => {
    const { db, users } = buildDb({ user: buildResetUser() });
    users.updateOne = vi.fn().mockResolvedValue({ modifiedCount: 1 });
    vi.mocked(bcrypt.compare).mockResolvedValue(true);
    vi.mocked(sendSecurityCodeEmail).mockResolvedValue({ success: true });
    const routes = mountRoute(setupSigninRoute, db);
    const req = createReq({ body: { email: 'user@example.com', password: 'password1' } });

    await callRoute(routes, 'POST /api/auth/signin', req);

    expect(users.updateOne.mock.calls[0][1].$set.securityCodePurpose).toBe(
      SECURITY_CODE_PURPOSES.LOGIN
    );
  });

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
