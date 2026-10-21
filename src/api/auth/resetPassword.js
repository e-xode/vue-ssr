import bcrypt from 'bcryptjs';
import { verifyCode } from '#src/shared/email.js';
import { BCRYPT_ROUNDS, SECURITY_CODE_MAX_ATTEMPTS } from '#src/shared/const.js';
import { assertNotBanned, destroyUserSessions, getClientIp } from '#src/shared/security.js';
import { logEvent } from '#src/shared/logger.js';
import { readEmail, readString } from '#src/shared/utils.js';

function getResetCodeError(user) {
  if (!user.securityCode || !user.securityCodeExpires) return 'error.auth.codeExpired';
  if (new Date() > new Date(user.securityCodeExpires)) return 'error.auth.codeExpired';
  if ((user.securityCodeAttempts || 0) >= SECURITY_CODE_MAX_ATTEMPTS) {
    return 'error.auth.tooManyAttempts';
  }
  return null;
}

export function setupResetPasswordRoute(app, db) {
  app.post('/api/auth/reset-password', async (req, res) => {
    const email = readEmail(req.body.email);
    const code = readString(req.body.code);
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

      if (!user || !user.resetPasswordPending) {
        return res.status(400).json({ error: 'error.auth.invalidResetRequest' });
      }

      if (!(await assertNotBanned(db, res, { ip, user }))) return;

      const codeError = getResetCodeError(user);
      if (codeError) {
        return res.status(400).json({ error: codeError });
      }

      if (!verifyCode(user.securityCode, code)) {
        await db
          .collection('users')
          .updateOne({ _id: user._id }, { $inc: { securityCodeAttempts: 1 } });
        logEvent(db, {
          event: 'auth-code-failed',
          userId: user._id,
          ip,
          meta: { reason: 'reset-password' },
        });
        return res.status(400).json({ error: 'error.auth.invalidCode' });
      }

      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: { password: hashedPassword, updatedAt: new Date() },
          $unset: {
            securityCode: '',
            securityCodeExpires: '',
            securityCodeAttempts: '',
            resetPasswordPending: '',
          },
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
