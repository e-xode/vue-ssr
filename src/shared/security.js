import fs from 'node:fs';
import path from 'node:path';
import { generateSecurityCode, hashCode, verifyCode } from '#src/shared/email.js';
import {
  CODE_LOCKOUT_MAX_FAILURES,
  CODE_LOCKOUT_WINDOW_MS,
  RESEND_COOLDOWN_MS,
  SECURITY_CODE_EXPIRY_MS,
  SECURITY_CODE_MAX_ATTEMPTS,
  SESSION_ABSOLUTE_MAX_AGE_MS,
  SESSION_DIR,
  SESSION_FILE_CONCURRENCY,
} from '#src/shared/const.js';

const LOGIN_HISTORY_MAX = 50;

export const SECURITY_CODE_UNSET = {
  securityCode: '',
  securityCodeExpires: '',
  securityCodeAttempts: '',
  securityCodePurpose: '',
  resetPasswordPending: '',
};

export const CODE_FAILURES_UNSET = {
  codeFailures: '',
  codeFailuresSince: '',
};

export const CODE_CHECK = {
  OK: 'ok',
  LOCKED: 'locked',
  EXHAUSTED: 'exhausted',
  INVALID: 'invalid',
};

export function getClientIp(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

export async function isIpBlocked(db, ip) {
  const blocked = await db.collection('blockedIps').findOne({ ip });
  return !!blocked;
}

export async function assertNotBanned(db, res, { ip = null, user = null }) {
  const banned = user?.isBlocked || (ip !== null && (await isIpBlocked(db, ip)));
  if (!banned) return true;
  res.status(403).json({ error: 'error.auth.blocked' });
  return false;
}

export function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => (err ? reject(err) : resolve()));
  });
}

export function destroySession(req) {
  return new Promise((resolve) => {
    req.session.destroy((err) => {
      if (err) console.error(err);
      resolve();
    });
  });
}

export function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((err) => (err ? reject(err) : resolve()));
  });
}

export async function startUserSession(req, userId, { createdAt = Date.now() } = {}) {
  await regenerateSession(req);
  req.session.userId = userId.toString();
  req.session.createdAt = createdAt;
  await saveSession(req);
}

export function isSessionExpired(session) {
  const createdAt = session?.createdAt;
  if (!Number.isFinite(createdAt)) return true;
  return Date.now() - createdAt > SESSION_ABSOLUTE_MAX_AGE_MS;
}

export function createSecurityCode(purpose) {
  const code = generateSecurityCode();
  const fields = {
    securityCode: hashCode(code),
    securityCodeExpires: new Date(Date.now() + SECURITY_CODE_EXPIRY_MS),
    securityCodeAttempts: 0,
    securityCodePurpose: purpose,
  };
  return { code, fields };
}

export function hasPendingCode(user, purpose) {
  return Boolean(
    user?.securityCode && user.securityCodeExpires && user.securityCodePurpose === purpose
  );
}

export async function claimCodeAttempt(db, userId, attemptsField = 'securityCodeAttempts') {
  const underLimit = { $not: { $gte: SECURITY_CODE_MAX_ATTEMPTS } };
  const filter = { _id: userId, [attemptsField]: underLimit };
  const result = await db.collection('users').updateOne(filter, { $inc: { [attemptsField]: 1 } });
  return result?.modifiedCount === 1;
}

export function remainingCodeAttempts(previousAttempts) {
  return Math.max(0, SECURITY_CODE_MAX_ATTEMPTS - ((previousAttempts || 0) + 1));
}

export function isCodeLocked(user, now = Date.now()) {
  const since = user?.codeFailuresSince;
  if (!(since instanceof Date) || now - since.getTime() >= CODE_LOCKOUT_WINDOW_MS) return false;
  return (user.codeFailures || 0) >= CODE_LOCKOUT_MAX_FAILURES;
}

export async function recordCodeFailure(db, userId, now = new Date()) {
  const windowStart = new Date(now.getTime() - CODE_LOCKOUT_WINDOW_MS);
  const windowExpired = { $lt: [{ $ifNull: ['$codeFailuresSince', new Date(0)] }, windowStart] };
  const nextCount = { $add: [{ $ifNull: ['$codeFailures', 0] }, 1] };

  await db.collection('users').updateOne({ _id: userId }, [
    {
      $set: {
        codeFailures: { $cond: [windowExpired, 1, nextCount] },
        codeFailuresSince: { $cond: [windowExpired, now, '$codeFailuresSince'] },
      },
    },
  ]);
}

export async function checkSubmittedCode(db, user, { code, storedHash, attemptsField }) {
  if (isCodeLocked(user)) return CODE_CHECK.LOCKED;
  if (!(await claimCodeAttempt(db, user._id, attemptsField))) return CODE_CHECK.EXHAUSTED;
  if (verifyCode(storedHash, code)) return CODE_CHECK.OK;
  await recordCodeFailure(db, user._id);
  return CODE_CHECK.INVALID;
}

export function resendWaitSeconds(user) {
  if (!user?.securityCodeExpires) return 0;
  const lastCodeTime = user.securityCodeExpires.getTime() - SECURITY_CODE_EXPIRY_MS;
  const remaining = RESEND_COOLDOWN_MS - (Date.now() - lastCodeTime);
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

export async function recordLoginIp(db, userId, ip) {
  const entry = { ip, date: new Date() };

  await db.collection('users').updateOne(
    { _id: userId },
    {
      $push: {
        loginHistory: {
          $each: [entry],
          $slice: -LOGIN_HISTORY_MAX,
        },
      },
    }
  );
}

function logUnlessMissing(err) {
  if (err?.code !== 'ENOENT') console.error(err);
}

async function removeSessionFileOfUser(file, userIdStr) {
  const filePath = path.join(SESSION_DIR, file);
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const session = JSON.parse(content);
    if (session.userId === userIdStr) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    logUnlessMissing(err);
  }
}

export async function destroyUserSessions(userId, excludeSessionId = null) {
  const userIdStr = userId.toString();

  let files;
  try {
    files = await fs.promises.readdir(SESSION_DIR);
  } catch (err) {
    logUnlessMissing(err);
    return;
  }

  const excludedFile = excludeSessionId ? `${excludeSessionId}.json` : null;
  const candidates = files.filter((file) => file.endsWith('.json') && file !== excludedFile);

  for (let i = 0; i < candidates.length; i += SESSION_FILE_CONCURRENCY) {
    const chunk = candidates.slice(i, i + SESSION_FILE_CONCURRENCY);
    await Promise.all(chunk.map((file) => removeSessionFileOfUser(file, userIdStr)));
  }
}
