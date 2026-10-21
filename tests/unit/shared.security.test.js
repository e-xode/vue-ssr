import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const sessionDirState = vi.hoisted(() => ({ dir: null }));

vi.mock('#src/shared/const.js', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    get SESSION_DIR() {
      return sessionDirState.dir;
    },
  };
});

const {
  assertNotBanned,
  destroyUserSessions,
  getClientIp,
  isSessionExpired,
  regenerateSession,
  resendWaitSeconds,
  startUserSession,
} = await import('#src/shared/security.js');
const { SECURITY_CODE_EXPIRY_MS, SESSION_ABSOLUTE_MAX_AGE_MS } =
  await import('#src/shared/const.js');
const { createCollection, createDb, createRes } = await import('../fixtures/routeHarness.js');

const USER_ID = '65f1c2a4b3d4e5f6a7b8c9d0';
const OTHER_USER_ID = '65f1c2a4b3d4e5f6a7b8c9d1';

function writeSession(dir, name, userId) {
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify({ userId }));
}

describe('shared/security.js', () => {
  describe('getClientIp', () => {
    it('returns req.ip and ignores a forged X-Forwarded-For header', () => {
      const req = { ip: '203.0.113.7', headers: { 'x-forwarded-for': '198.51.100.1' } };

      expect(getClientIp(req)).toBe('203.0.113.7');
    });

    it('falls back to the socket address, then to unknown', () => {
      expect(getClientIp({ headers: {}, socket: { remoteAddress: '192.0.2.4' } })).toBe(
        '192.0.2.4'
      );
      expect(getClientIp({ headers: {} })).toBe('unknown');
    });
  });

  describe('assertNotBanned', () => {
    it('passes when neither the IP nor the user is blocked', async () => {
      const db = createDb({ blockedIps: createCollection() });
      const res = createRes();

      const ok = await assertNotBanned(db, res, { ip: '203.0.113.7', user: { isBlocked: false } });

      expect(ok).toBe(true);
      expect(res.body).toBeUndefined();
    });

    it('answers 403 for a blocked IP', async () => {
      const blockedIps = createCollection({ findOne: async () => ({ ip: '203.0.113.7' }) });
      const res = createRes();

      const ok = await assertNotBanned(createDb({ blockedIps }), res, { ip: '203.0.113.7' });

      expect(ok).toBe(false);
      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({ error: 'error.auth.blocked' });
    });

    it('answers 403 for a blocked user without querying the IP list', async () => {
      const findOne = vi.fn();
      const db = createDb({ blockedIps: createCollection({ findOne }) });
      const res = createRes();

      const ok = await assertNotBanned(db, res, { ip: '203.0.113.7', user: { isBlocked: true } });

      expect(ok).toBe(false);
      expect(res.statusCode).toBe(403);
      expect(findOne).not.toHaveBeenCalled();
    });
  });

  describe('session helpers', () => {
    it('regenerateSession resolves when the store regenerates', async () => {
      const req = { session: { regenerate: vi.fn((cb) => cb()) } };

      await regenerateSession(req);

      expect(req.session.regenerate).toHaveBeenCalled();
    });

    it('regenerateSession rejects when the store fails', async () => {
      const req = { session: { regenerate: vi.fn((cb) => cb(new Error('store down'))) } };

      await expect(regenerateSession(req)).rejects.toThrow('store down');
    });

    it('startUserSession regenerates, stores the user id as a string, then saves', async () => {
      const order = [];
      const session = {
        regenerate: vi.fn((cb) => {
          order.push('regenerate');
          cb();
        }),
        save: vi.fn((cb) => {
          order.push('save');
          cb();
        }),
      };

      await startUserSession({ session }, { toString: () => USER_ID });

      expect(order).toEqual(['regenerate', 'save']);
      expect(session.userId).toBe(USER_ID);
      expect(Number.isFinite(session.createdAt)).toBe(true);
    });

    it('startUserSession keeps a provided creation time when rotating', async () => {
      const session = { regenerate: (cb) => cb(), save: (cb) => cb() };

      await startUserSession({ session }, USER_ID, { createdAt: 1234 });

      expect(session.createdAt).toBe(1234);
    });

    it('isSessionExpired flags missing, old and fresh sessions', () => {
      expect(isSessionExpired({})).toBe(true);
      expect(isSessionExpired(undefined)).toBe(true);
      expect(isSessionExpired({ createdAt: Date.now() })).toBe(false);
      expect(isSessionExpired({ createdAt: Date.now() - SESSION_ABSOLUTE_MAX_AGE_MS - 1 })).toBe(
        true
      );
    });

    it('resendWaitSeconds reports the remaining cooldown', () => {
      const justIssued = { securityCodeExpires: new Date(Date.now() + SECURITY_CODE_EXPIRY_MS) };
      const issuedLongAgo = {
        securityCodeExpires: new Date(Date.now() + SECURITY_CODE_EXPIRY_MS - 60 * 1000),
      };

      expect(resendWaitSeconds(justIssued)).toBeGreaterThan(0);
      expect(resendWaitSeconds(issuedLongAgo)).toBe(0);
      expect(resendWaitSeconds({})).toBe(0);
    });
  });

  describe('destroyUserSessions', () => {
    let tempRoot;

    beforeEach(() => {
      tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sessions-'));
      sessionDirState.dir = tempRoot;
    });

    afterEach(() => {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    });

    it('removes every session of the user and keeps the others', async () => {
      writeSession(sessionDirState.dir, 'a', USER_ID);
      writeSession(sessionDirState.dir, 'b', USER_ID);
      writeSession(sessionDirState.dir, 'c', OTHER_USER_ID);

      await destroyUserSessions(USER_ID);

      expect(fs.readdirSync(sessionDirState.dir)).toEqual(['c.json']);
    });

    it('keeps the excluded session', async () => {
      writeSession(sessionDirState.dir, 'current', USER_ID);
      writeSession(sessionDirState.dir, 'old', USER_ID);

      await destroyUserSessions(USER_ID, 'current');

      expect(fs.readdirSync(sessionDirState.dir)).toEqual(['current.json']);
    });

    it('handles more sessions than one concurrency chunk', async () => {
      for (let i = 0; i < 45; i++) writeSession(sessionDirState.dir, `s${i}`, USER_ID);
      writeSession(sessionDirState.dir, 'keep', OTHER_USER_ID);

      await destroyUserSessions(USER_ID);

      expect(fs.readdirSync(sessionDirState.dir)).toEqual(['keep.json']);
    });

    it('logs an unreadable session file and carries on', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      fs.writeFileSync(path.join(sessionDirState.dir, 'broken.json'), '{not json');
      writeSession(sessionDirState.dir, 'mine', USER_ID);

      await destroyUserSessions(USER_ID);

      expect(errorSpy).toHaveBeenCalled();
      expect(fs.readdirSync(sessionDirState.dir)).toEqual(['broken.json']);
    });

    it('returns silently when the session directory does not exist', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      sessionDirState.dir = path.join(tempRoot, 'missing');

      await expect(destroyUserSessions(USER_ID)).resolves.toBeUndefined();
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });
});
