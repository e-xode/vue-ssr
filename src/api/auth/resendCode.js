import { sendSecurityCodeEmail, generateSecurityCode, hashCode } from '#src/shared/email.js';
import { SECURITY_CODE_EXPIRY_MS } from '#src/shared/const.js';
import { assertNotBanned, getClientIp, resendWaitSeconds } from '#src/shared/security.js';
import { logEvent } from '#src/shared/logger.js';
import { readEmail, readString } from '#src/shared/utils.js';
import { deliverEmail } from '#src/api/emailDelivery.js';

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
      if (!user || !user.securityCode || !user.securityCodeExpires) {
        return res.json({ status: 'code_sent', email });
      }

      if (!(await assertNotBanned(db, res, { ip, user }))) return;

      const waitSeconds = resendWaitSeconds(user);
      if (waitSeconds > 0) {
        return res.status(429).json({ error: 'error.auth.waitBeforeResend', waitSeconds });
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
          },
        }
      );

      const sending = sendSecurityCodeEmail(email, code, locale || user.locale || 'en');
      if (!(await deliverEmail(res, sending))) return;

      logEvent(db, { event: 'auth-resend-code', userId: user._id, ip, meta: { email } });

      res.json({ status: 'code_sent', email });
    } catch (err) {
      console.error('Resend code error:', err);
      res.status(500).json({ error: 'error.server' });
    }
  });
}
