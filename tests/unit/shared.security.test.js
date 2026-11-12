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
  checkSubmittedCode,
  claimCodeAttempt,
  CODE_CHECK,
  createSecurityCode,
  destroySession,
  destroyUserSessions,
  hasPendingCode,
  isCodeLocked,
  recordCodeFailure,
  getClientIp,
  isSessionExpired,
  regenerateSession,
  remainingCodeAttempts,
  resendWaitSeconds,
  startUserSession,
} = await import('#src/shared/security.js');
const {
  CODE_LOCKOUT_MAX_FAILURES,
  CODE_LOCKOUT_WINDOW_MS,
  SECURITY_CODE_EXPIRY_MS,
  SECURITY_CODE_MAX_ATTEMPTS,
  SECURITY_CODE_PURPOSES,
  SESSION_ABSOLUTE_MAX_AGE_MS,
} = await import('#src/shared/const.js');
const { hashCode } = await import('#src/shared/email.js');
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

  describe('code attempts', () => {
    it('claims an attempt with one conditional increment', async () => {
      const updateOne = vi.fn().mockResolvedValue({ modifiedCount: 1 });
      const db = createDb({ users: createCollection({ updateOne }) });

      expect(await claimCodeAttempt(db, USER_ID)).toBe(true);

      const [filter, update] = updateOne.mock.calls[0];
      expect(filter).toEqual({
        _id: USER_ID,
        securityCodeAttempts: { $not: { $gte: SECURITY_CODE_MAX_ATTEMPTS } },
      });
      expect(update).toEqual({ $inc: { securityCodeAttempts: 1 } });
    });

    it('refuses the attempt when the limit was already reached', async () => {
      const updateOne = vi.fn().mockResolvedValue({ modifiedCount: 0 });
      const db = createDb({ users: createCollection({ updateOne }) });

      expect(await claimCodeAttempt(db, USER_ID, 'pendingEmailCodeAttempts')).toBe(false);
      expect(updateOne.mock.calls[0][1]).toEqual({ $inc: { pendingEmailCodeAttempts: 1 } });
    });

    it('reports the attempts left after the current one', () => {
      expect(remainingCodeAttempts(undefined)).toBe(SECURITY_CODE_MAX_ATTEMPTS - 1);
      expect(remainingCodeAttempts(1)).toBe(SECURITY_CODE_MAX_ATTEMPTS - 2);
      expect(remainingCodeAttempts(SECURITY_CODE_MAX_ATTEMPTS)).toBe(0);
    });
  });

  describe('security codes', () => {
    it('creates a code with its hash, expiry, purpose and a fresh attempt counter', () => {
      const { code, fields } = createSecurityCode(SECURITY_CODE_PURPOSES.LOGIN);

      expect(code).toMatch(/^\d{6}$/);
      expect(fields.securityCode).toBe(hashCode(code));
      expect(fields.securityCodeAttempts).toBe(0);
      expect(fields.securityCodePurpose).toBe(SECURITY_CODE_PURPOSES.LOGIN);
      expect(fields.securityCodeExpires.getTime()).toBeGreaterThan(Date.now());
    });

    it('recognises a pending code only for its own purpose', () => {
      const { fields } = createSecurityCode(SECURITY_CODE_PURPOSES.RESET_PASSWORD);

      expect(hasPendingCode(fields, SECURITY_CODE_PURPOSES.RESET_PASSWORD)).toBe(true);
      expect(hasPendingCode(fields, SECURITY_CODE_PURPOSES.LOGIN)).toBe(false);
      expect(hasPendingCode({ ...fields, securityCodePurpose: undefined }, 'login')).toBe(false);
      expect(hasPendingCode(null, SECURITY_CODE_PURPOSES.LOGIN)).toBe(false);
    });

    it('locks an account only at the failure limit inside the window', () => {
      const recent = new Date(Date.now() - 1000);
      const old = new Date(Date.now() - CODE_LOCKOUT_WINDOW_MS - 1000);

      const max = CODE_LOCKOUT_MAX_FAILURES;

      expect(isCodeLocked({ codeFailures: max, codeFailuresSince: recent })).toBe(true);
      expect(isCodeLocked({ codeFailures: max - 1, codeFailuresSince: recent })).toBe(false);
      expect(isCodeLocked({ codeFailures: max, codeFailuresSince: old })).toBe(false);
      expect(isCodeLocked({})).toBe(false);
    });

    it('records a failure with one pipeline update that restarts an expired window', async () => {
      const updateOne = vi.fn().mockResolvedValue({ modifiedCount: 1 });
      const db = createDb({ users: createCollection({ updateOne }) });
      const now = new Date();

      await recordCodeFailure(db, USER_ID, now);

      expect(updateOne).toHaveBeenCalledTimes(1);
      const [filter, pipeline] = updateOne.mock.calls[0];
      expect(filter).toEqual({ _id: USER_ID });
      const stage = pipeline[0].$set;
      expect(stage.codeFailures.$cond[1]).toBe(1);
      expect(stage.codeFailuresSince.$cond[1]).toBe(now);
      expect(stage.codeFailuresSince.$cond[2]).toBe('$codeFailuresSince');
    });

    it('checks a submitted code: ok, invalid (recorded), exhausted and locked', async () => {
      const updateOne = vi.fn().mockResolvedValue({ modifiedCount: 1 });
      const db = createDb({ users: createCollection({ updateOne }) });
      const user = { _id: USER_ID };
      const storedHash = hashCode('123456');

      const check = (target, code) => checkSubmittedCode(db, target, { code, storedHash });

      expect(await check(user, '123456')).toBe(CODE_CHECK.OK);
      expect(updateOne).toHaveBeenCalledTimes(1);

      expect(await check(user, '000000')).toBe(CODE_CHECK.INVALID);
      expect(updateOne).toHaveBeenCalledTimes(3);

      updateOne.mockResolvedValue({ modifiedCount: 0 });
      expect(await check(user, '123456')).toBe(CODE_CHECK.EXHAUSTED);

      const locked = {
        _id: USER_ID,
        codeFailures: CODE_LOCKOUT_MAX_FAILURES,
        codeFailuresSince: new Date(),
      };
      updateOne.mockClear();
      expect(await check(locked, '123456')).toBe(CODE_CHECK.LOCKED);
      expect(updateOne).not.toHaveBeenCalled();
    });
  });

  describe('assertNotBanned', () => {
    it('checks only the user flag when no IP is given', async () => {
      const findOne = vi.fn();
      const db = createDb({ blockedIps: createCollection({ findOne }) });

      expect(await assertNotBanned(db, createRes(), { user: { isBlocked: false } })).toBe(true);
      expect(findOne).not.toHaveBeenCalled();
    });

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
    it('destroySession resolves after the store callback and logs a failure', async () => {
      const failure = new Error('store down');
      const req = { session: { destroy: vi.fn((done) => done(failure)) } };

      await destroySession(req);

      expect(req.session.destroy).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(failure);
    });

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
