import { verifyCode } from '#src/shared/email.js';
import { SECURITY_CODE_MAX_ATTEMPTS, USER_SAFE_PROJECTION } from '#src/shared/const.js';
import {
  assertNotBanned,
  getClientIp,
  recordLoginIp,
  startUserSession,
} from '#src/shared/security.js';
import { logEvent } from '#src/shared/logger.js';
import { readEmail, readString } from '#src/shared/utils.js';

async function verifyLoginCode(res, db, user, { code, ip, email }) {
  if (new Date() > user.securityCodeExpires) {
    await db
      .collection('users')
      .updateOne({ _id: user._id }, { $unset: { securityCode: '', securityCodeExpires: '' } });
    res.status(400).json({ error: 'error.auth.codeExpired' });
    return false;
  }

  const attempts = (user.securityCodeAttempts || 0) + 1;
  if (attempts > SECURITY_CODE_MAX_ATTEMPTS) {
    await db
      .collection('users')
      .updateOne({ _id: user._id }, { $unset: { securityCode: '', securityCodeExpires: '' } });
    logEvent(db, {
      event: 'auth-code-failed',
      userId: user._id,
      ip,
      meta: { email, reason: 'too-many-attempts' },
    });
    res.status(429).json({ error: 'error.auth.tooManyAttempts' });
    return false;
  }

  if (!verifyCode(user.securityCode, code)) {
    await db
      .collection('users')
      .updateOne({ _id: user._id }, { $set: { securityCodeAttempts: attempts } });
    logEvent(db, {
      event: 'auth-code-failed',
      userId: user._id,
      ip,
      meta: { email, reason: 'invalid-code' },
    });
    res.status(401).json({
      error: 'error.auth.invalidCode',
      attempts: SECURITY_CODE_MAX_ATTEMPTS - attempts,
    });
    return false;
  }

  return true;
}

async function completeLoginSession(req, db, user, ip) {
  await db
    .collection('users')
    .updateOne(
      { _id: user._id },
      { $unset: { securityCode: '', securityCodeExpires: '', securityCodeAttempts: '' } }
    );

  await recordLoginIp(db, user._id, ip);

  await startUserSession(req, user._id);

  return db.collection('users').findOne({ _id: user._id }, { projection: USER_SAFE_PROJECTION });
}

export function setupVerifyCodeRoute(app, db) {
  app.post('/api/auth/verify-code', async (req, res) => {
    const email = readEmail(req.body.email);
    const code = readString(req.body.code);

    if (!email || !code) {
      return res.status(400).json({ error: 'error.auth.emailAndCodeRequired' });
    }

    try {
      const ip = getClientIp(req);

      if (!(await assertNotBanned(db, res, { ip }))) return;

      const user = await db.collection('users').findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'error.auth.emailNotFound' });
      }

      if (!(await assertNotBanned(db, res, { ip, user }))) return;

      if (!user.securityCode || !user.securityCodeExpires) {
        return res.status(400).json({ error: 'error.auth.noVerificationPending' });
      }

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
