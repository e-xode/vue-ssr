import { describe, it, expect } from 'vitest';
import { isDevLoginEnabled, isValidDevToken, setupDevLoginRoute } from '#src/api/dev/login.js';

const TOKEN = 't'.repeat(40);

describe('isDevLoginEnabled', () => {
  it('requires the explicit opt-in and a long token', () => {
    expect(isDevLoginEnabled({ NODE_ENV: 'development' })).toBe(false);
    expect(
      isDevLoginEnabled({
        NODE_ENV: 'development',
        DEV_LOGIN_ENABLED: 'false',
        DEV_LOGIN_TOKEN: TOKEN,
      })
    ).toBe(false);
    expect(isDevLoginEnabled({ NODE_ENV: 'development', DEV_LOGIN_ENABLED: 'true' })).toBe(false);
    expect(
      isDevLoginEnabled({
        NODE_ENV: 'development',
        DEV_LOGIN_ENABLED: 'true',
        DEV_LOGIN_TOKEN: 'short',
      })
    ).toBe(false);
    expect(
      isDevLoginEnabled({
        NODE_ENV: 'development',
        DEV_LOGIN_ENABLED: 'true',
        DEV_LOGIN_TOKEN: TOKEN,
      })
    ).toBe(true);
  });

  it('is always off in production', () => {
    expect(
      isDevLoginEnabled({
        NODE_ENV: 'production',
        DEV_LOGIN_ENABLED: 'true',
        DEV_LOGIN_TOKEN: TOKEN,
      })
    ).toBe(false);
  });
});

describe('isValidDevToken', () => {
  it('accepts only the exact token', () => {
    expect(isValidDevToken(TOKEN, TOKEN)).toBe(true);
    expect(isValidDevToken(TOKEN + 'x', TOKEN)).toBe(false);
    expect(isValidDevToken(undefined, TOKEN)).toBe(false);
    expect(isValidDevToken('', '')).toBe(false);
  });
});

describe('setupDevLoginRoute', () => {
  it('mounts nothing when disabled or in production', () => {
    const routes = [];
    const app = { post: (path) => routes.push(path) };
    setupDevLoginRoute(
      app,
      {},
      { NODE_ENV: 'production', DEV_LOGIN_ENABLED: 'true', DEV_LOGIN_TOKEN: TOKEN }
    );
    setupDevLoginRoute(app, {}, { NODE_ENV: 'development' });
    expect(routes).toEqual([]);
  });

  it('mounts the route when enabled', () => {
    const routes = [];
    const app = { post: (path) => routes.push(path) };
    setupDevLoginRoute(
      app,
      {},
      { NODE_ENV: 'development', DEV_LOGIN_ENABLED: 'true', DEV_LOGIN_TOKEN: TOKEN }
    );
    expect(routes).toEqual(['/api/dev/login']);
  });
});
