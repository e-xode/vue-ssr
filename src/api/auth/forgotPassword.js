import { sendResetPasswordEmail } from '#src/shared/email.js';
import { SECURITY_CODE_PURPOSES } from '#src/shared/const.js';
import {
  assertNotBanned,
  createSecurityCode,
  getClientIp,
  hasPendingCode,
  resendWaitSeconds,
} from '#src/shared/security.js';
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

      if (user.isBlocked) {
        logEvent(db, {
          event: 'user-forgot-password',
          userId: user._id,
          ip,
          meta: { email, blocked: true },
        });
        return res.json({ status: 'sent' });
      }

      const resetPending = hasPendingCode(user, SECURITY_CODE_PURPOSES.RESET_PASSWORD);
      if (resetPending && resendWaitSeconds(user) > 0) {
        return res.json({ status: 'sent' });
      }

      const { code, fields } = createSecurityCode(SECURITY_CODE_PURPOSES.RESET_PASSWORD);
      await db.collection('users').updateOne({ _id: user._id }, { $set: fields });

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
