import { sendResetPasswordEmail, sendSecurityCodeEmail } from '#src/shared/email.js';
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

const SENDERS = {
  [SECURITY_CODE_PURPOSES.LOGIN]: sendSecurityCodeEmail,
  [SECURITY_CODE_PURPOSES.RESET_PASSWORD]: sendResetPasswordEmail,
};

function pendingPurpose(user) {
  return Object.keys(SENDERS).find((purpose) => hasPendingCode(user, purpose)) ?? null;
}

export function setupResendCodeRoute(app, db) {
  app.post('/api/auth/resend-code', async (req, res) => {
    const email = readEmail(req.body.email);
    const locale = readString(req.body.locale);

    if (!email) {
      return res.status(400).json({ error: 'error.auth.emailRequired' });
    }

    try {
      const ip = getClientIp(req);
      if (!(await assertNotBanned(db, res, { ip }))) return;

      const user = await db.collection('users').findOne({ email });
      const purpose = pendingPurpose(user);
      if (!purpose) {
        return res.json({ status: 'code_sent', email });
      }

      if (!(await assertNotBanned(db, res, { user }))) return;

      const waitSeconds = resendWaitSeconds(user);
      if (waitSeconds > 0) {
        return res.status(429).json({ error: 'error.auth.waitBeforeResend', waitSeconds });
      }

      const { code, fields } = createSecurityCode(purpose);
      await db.collection('users').updateOne({ _id: user._id }, { $set: fields });

      const sending = SENDERS[purpose](email, code, locale || 'en');
      if (!(await deliverEmail(res, sending))) return;

      logEvent(db, { event: 'auth-resend-code', userId: user._id, ip, meta: { email, purpose } });

      res.json({ status: 'code_sent', email });
    } catch (err) {
      console.error('Resend code error:', err);
      res.status(500).json({ error: 'error.server' });
    }
  });
}
