import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS, SECURITY_CODE_PURPOSES } from '#src/shared/const.js';
import {
  assertNotBanned,
  checkSubmittedCode,
  CODE_CHECK,
  CODE_FAILURES_UNSET,
  destroyUserSessions,
  getClientIp,
  hasPendingCode,
  SECURITY_CODE_UNSET,
} from '#src/shared/security.js';
import { logEvent } from '#src/shared/logger.js';
import { readEmail, readString, readTrimmed } from '#src/shared/utils.js';

const CODE_CHECK_ERRORS = {
  [CODE_CHECK.LOCKED]: 'error.auth.tooManyAttempts',
  [CODE_CHECK.EXHAUSTED]: 'error.auth.tooManyAttempts',
  [CODE_CHECK.INVALID]: 'error.auth.invalidCode',
};

async function getResetCodeError(db, user, code) {
  if (new Date() > new Date(user.securityCodeExpires)) return 'error.auth.codeExpired';
  const outcome = await checkSubmittedCode(db, user, { code, storedHash: user.securityCode });
  return CODE_CHECK_ERRORS[outcome] ?? null;
}

export function setupResetPasswordRoute(app, db) {
  app.post('/api/auth/reset-password', async (req, res) => {
    const email = readEmail(req.body.email);
    const code = readTrimmed(req.body.code);
    const password = readString(req.body.password);

    if (!email || !code || !password) {
      return res.status(400).json({ error: 'error.auth.allFieldsRequired' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'error.auth.passwordTooShort' });
    }

    try {
      const ip = getClientIp(req);
      if (!(await assertNotBanned(db, res, { ip }))) return;

      const user = await db.collection('users').findOne({ email });

      if (!hasPendingCode(user, SECURITY_CODE_PURPOSES.RESET_PASSWORD)) {
        return res.status(400).json({ error: 'error.auth.invalidResetRequest' });
      }

      if (!(await assertNotBanned(db, res, { user }))) return;

      const codeError = await getResetCodeError(db, user, code);
      if (codeError) {
        logEvent(db, {
          event: 'auth-code-failed',
          userId: user._id,
          ip,
          meta: { reason: 'reset-password' },
        });
        return res.status(400).json({ error: codeError });
      }

      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: { password: hashedPassword, updatedAt: new Date() },
          $unset: { ...SECURITY_CODE_UNSET, ...CODE_FAILURES_UNSET },
        }
      );

      await destroyUserSessions(user._id);

      logEvent(db, { event: 'user-reset-password', userId: user._id, ip });

      res.json({ status: 'ok' });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ error: 'error.server' });
    }
  });
}
