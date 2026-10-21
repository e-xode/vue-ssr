import fs from 'node:fs';
import path from 'node:path';
import {
  RESEND_COOLDOWN_MS,
  SECURITY_CODE_EXPIRY_MS,
  SESSION_ABSOLUTE_MAX_AGE_MS,
  SESSION_DIR,
  SESSION_FILE_CONCURRENCY,
} from '#src/shared/const.js';

const LOGIN_HISTORY_MAX = 50;

export function getClientIp(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

export async function isIpBlocked(db, ip) {
  const blocked = await db.collection('blockedIps').findOne({ ip });
  return !!blocked;
}

export async function assertNotBanned(db, res, { ip, user = null }) {
  const banned = user?.isBlocked || (await isIpBlocked(db, ip));
  if (!banned) return true;
  res.status(403).json({ error: 'error.auth.blocked' });
  return false;
}

export function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => (err ? reject(err) : resolve()));
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
