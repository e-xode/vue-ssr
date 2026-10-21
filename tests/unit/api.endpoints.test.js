import { describe, it, expect, vi } from 'vitest';
import { setupSignupRoute } from '#src/api/auth/signup.js';
import { setupSigninRoute } from '#src/api/auth/signin.js';
import { setupVerifyCodeRoute } from '#src/api/auth/verifyCode.js';
import {
  callRoute,
  createCollection,
  createDb,
  createReq,
  createRouteApp,
} from '../fixtures/routeHarness.js';

function mountRoute(setup) {
  const users = createCollection({ findOne: vi.fn().mockResolvedValue(null) });
  const { app, routes } = createRouteApp();
  setup(app, createDb({ users }));
  return { routes, users };
}

async function post(setup, path, body) {
  const { routes, users } = mountRoute(setup);
  const res = await callRoute(routes, `POST ${path}`, createReq({ body }));
  return { res, users };
}

const SIGNUP = '/api/auth/signup';
const SIGNIN = '/api/auth/signin';
const VERIFY_CODE = '/api/auth/verify-code';

const validSignup = { email: 'user@example.com', password: 'password123', name: 'Test User' };

describe('api/auth signup validation', () => {
  it.each([
    ['a missing email', { ...validSignup, email: undefined }, 'error.auth.missingFields'],
    ['a missing password', { ...validSignup, password: undefined }, 'error.auth.missingFields'],
    ['a missing name', { ...validSignup, name: undefined }, 'error.auth.missingFields'],
    ['an invalid email', { ...validSignup, email: 'invalid-email' }, 'error.auth.invalidEmail'],
    ['a short password', { ...validSignup, password: 'short' }, 'error.auth.passwordTooShort'],
    ['a one-letter name', { ...validSignup, name: ' a ' }, 'error.auth.nameTooShort'],
  ])('answers 400 for %s without querying users', async (_label, body, error) => {
    const { res, users } = await post(setupSignupRoute, SIGNUP, body);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error });
    expect(users.findOne).not.toHaveBeenCalled();
  });
});

const REQUIRED = 'error.auth.emailAndPasswordRequired';
const INVALID = 'error.auth.invalidCredentials';

describe('api/auth signin validation', () => {
  it.each([
    ['a missing password', { email: 'user@example.com' }, REQUIRED],
    ['a null password', { email: 'user@example.com', password: null }, REQUIRED],
    ['a missing email', { password: 'password123' }, REQUIRED],
    ['a malformed email', { email: 'bad', password: 'password123' }, INVALID],
  ])('answers 400 for %s without querying users', async (_label, body, error) => {
    const { res, users } = await post(setupSigninRoute, SIGNIN, body);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error });
    expect(users.findOne).not.toHaveBeenCalled();
  });
});

describe('api/auth verify-code validation', () => {
  it.each([
    ['a missing code', { email: 'user@example.com' }],
    ['an empty code', { email: 'user@example.com', code: '' }],
    ['a missing email', { code: '123456' }],
  ])('answers 400 for %s without querying users', async (_label, body) => {
    const { res, users } = await post(setupVerifyCodeRoute, VERIFY_CODE, body);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'error.auth.emailAndCodeRequired' });
    expect(users.findOne).not.toHaveBeenCalled();
  });
});
