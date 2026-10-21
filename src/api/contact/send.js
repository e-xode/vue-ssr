import { EMAIL_REGEX } from '#src/shared/const.js';
import { sendContactEmail } from '#src/shared/email.js';
import { logEvent } from '#src/shared/logger.js';
import { getClientIp } from '#src/shared/security.js';
import { verifyCaptcha } from '#src/shared/captcha.js';
import { escapeHtml, readEmail, readString } from '#src/shared/utils.js';
import { deliverEmail } from '#src/api/emailDelivery.js';

export function setupContactRoute(app, db) {
  app.post('/api/contact', async (req, res) => {
    try {
      const name = readString(req.body.name);
      const email = readEmail(req.body.email);
      const message = readString(req.body.message);
      const locale = readString(req.body.locale);

      if (!name || !email || !message) {
        return res.status(400).json({ error: 'error.missingFields' });
      }

      if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: 'error.invalidEmail' });
      }

      if (message.length > 5000) {
        return res.status(400).json({ error: 'error.messageTooLong' });
      }

      const { captchaToken } = req.body;
      const captcha = await verifyCaptcha(captchaToken, 'contact');
      if (!captcha.success) return res.status(400).json({ error: 'error.auth.captchaFailed' });

      const ip = getClientIp(req);
      const data = {
        name: escapeHtml(name.trim()),
        email: escapeHtml(email),
        message: escapeHtml(message.trim()),
      };

      const sending = sendContactEmail(data, locale || 'en');
      if (!(await deliverEmail(res, sending))) return;

      logEvent(db, { event: 'contact-sent', ip, meta: { name: data.name, email: data.email } });

      res.json({ status: 'ok' });
    } catch (err) {
      console.error('Contact send error:', err);
      res.status(500).json({ error: 'error.server' });
    }
  });
}
