import { SECURITY_CODE_PURPOSES, USER_SAFE_PROJECTION } from '#src/shared/const.js';
import {
  assertNotBanned,
  checkSubmittedCode,
  CODE_CHECK,
  CODE_FAILURES_UNSET,
  getClientIp,
  hasPendingCode,
  recordLoginIp,
  remainingCodeAttempts,
  SECURITY_CODE_UNSET,
  startUserSession,
} from '#src/shared/security.js';
import { logEvent } from '#src/shared/logger.js';
import { readEmail, readTrimmed } from '#src/shared/utils.js';

const INVALID_CODE_ERROR = 'error.auth.invalidCode';

function clearLoginCode(db, userId) {
  return db.collection('users').updateOne({ _id: userId }, { $unset: SECURITY_CODE_UNSET });
}

function logCodeFailure(db, user, { ip, email, reason }) {
  logEvent(db, { event: 'auth-code-failed', userId: user._id, ip, meta: { email, reason } });
}

async function verifyLoginCode(res, db, user, { code, ip, email }) {
  if (new Date() > user.securityCodeExpires) {
    await clearLoginCode(db, user._id);
    res.status(400).json({ error: 'error.auth.codeExpired' });
    return false;
  }

  const outcome = await checkSubmittedCode(db, user, { code, storedHash: user.securityCode });

  if (outcome === CODE_CHECK.LOCKED || outcome === CODE_CHECK.EXHAUSTED) {
    if (outcome === CODE_CHECK.EXHAUSTED) await clearLoginCode(db, user._id);
    logCodeFailure(db, user, { ip, email, reason: 'too-many-attempts' });
    res.status(429).json({ error: 'error.auth.tooManyAttempts' });
    return false;
  }

  if (outcome === CODE_CHECK.INVALID) {
    logCodeFailure(db, user, { ip, email, reason: 'invalid-code' });
    res.status(401).json({
      error: INVALID_CODE_ERROR,
      attempts: remainingCodeAttempts(user.securityCodeAttempts),
    });
    return false;
  }

  return true;
}

async function completeLoginSession(req, db, user, ip) {
  const verifiedUser = await db
    .collection('users')
    .findOneAndUpdate(
      { _id: user._id },
      { $unset: { ...SECURITY_CODE_UNSET, ...CODE_FAILURES_UNSET } },
      { projection: USER_SAFE_PROJECTION, returnDocument: 'after' }
    );

  await recordLoginIp(db, user._id, ip);
  await startUserSession(req, user._id);

  return verifiedUser;
}

export function setupVerifyCodeRoute(app, db) {
  app.post('/api/auth/verify-code', async (req, res) => {
    const email = readEmail(req.body.email);
    const code = readTrimmed(req.body.code);

    if (!email || !code) {
      return res.status(400).json({ error: 'error.auth.emailAndCodeRequired' });
    }

    try {
      const ip = getClientIp(req);
      if (!(await assertNotBanned(db, res, { ip }))) return;

      const user = await db.collection('users').findOne({ email });
      if (!hasPendingCode(user, SECURITY_CODE_PURPOSES.LOGIN)) {
        return res.status(401).json({ error: INVALID_CODE_ERROR });
      }

      if (!(await assertNotBanned(db, res, { user }))) return;

      const codeValid = await verifyLoginCode(res, db, user, { code, ip, email });
      if (!codeValid) return;

      const verifiedUser = await completeLoginSession(req, db, user, ip);

      logEvent(db, { event: 'auth-code-verified', userId: user._id, ip, meta: { email } });

      res.json({ status: 'verified', user: verifiedUser });
    } catch (err) {
      console.error('Verify code error:', err);
      res.status(500).json({ error: 'error.server' });
    }
  });
}
