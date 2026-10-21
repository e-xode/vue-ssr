import { generateSecurityCode, hashCode, sendResetPasswordEmail } from '#src/shared/email.js';
import { SECURITY_CODE_EXPIRY_MS } from '#src/shared/const.js';
import { assertNotBanned, getClientIp, resendWaitSeconds } from '#src/shared/security.js';
import { logEvent } from '#src/shared/logger.js';
import { readEmail, readString } from '#src/shared/utils.js';
import { deliverEmail } from '#src/api/emailDelivery.js';

export function setupForgotPasswordRoute(app, db) {
  app.post('/api/auth/forgot-password', async (req, res) => {
    const email = readEmail(req.body.email);
    const locale = readString(req.body.locale);
    if (!email) return res.status(400).json({ error: 'error.auth.emailRequired' });

    try {
      const ip = getClientIp(req);
      if (!(await assertNotBanned(db, res, { ip }))) return;

      const user = await db.collection('users').findOne({ email });

      if (!user) {
        logEvent(db, { event: 'user-forgot-password', ip, meta: { email, found: false } });
        return res.json({ status: 'sent' });
      }

      if (!(await assertNotBanned(db, res, { ip, user }))) return;

      if (user.resetPasswordPending && resendWaitSeconds(user) > 0) {
        return res.json({ status: 'sent' });
      }

      const code = generateSecurityCode();
      const codeHash = hashCode(code);
      const codeExpires = new Date(Date.now() + SECURITY_CODE_EXPIRY_MS);

      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: {
            securityCode: codeHash,
            securityCodeExpires: codeExpires,
            securityCodeAttempts: 0,
            resetPasswordPending: true,
          },
        }
      );

      const sending = sendResetPasswordEmail(email, code, locale || user.locale || 'en');
      if (!(await deliverEmail(res, sending))) return;

      logEvent(db, { event: 'user-forgot-password', userId: user._id, ip, meta: { email } });

      res.json({ status: 'sent' });
    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).json({ error: 'error.server' });
    }
  });
}
