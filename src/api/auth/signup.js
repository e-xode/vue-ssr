import bcrypt from 'bcryptjs';
import { sendSecurityCodeEmail, generateSecurityCode, hashCode } from '#src/shared/email.js';
import {
  USER_TYPES,
  SECURITY_CODE_EXPIRY_MS,
  BCRYPT_ROUNDS,
  EMAIL_REGEX,
} from '#src/shared/const.js';
import { assertNotBanned, getClientIp } from '#src/shared/security.js';
import { logEvent } from '#src/shared/logger.js';
import { verifyCaptcha } from '#src/shared/captcha.js';
import { readEmail, readString } from '#src/shared/utils.js';
import { deliverEmail } from '#src/api/emailDelivery.js';

export function setupSignupRoute(app, db) {
  app.post('/api/auth/signup', async (req, res) => {
    const email = readEmail(req.body.email);
    const password = readString(req.body.password);
    const name = readString(req.body.name);
    const locale = readString(req.body.locale);
    const { captchaToken } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'error.auth.missingFields' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'error.auth.invalidEmail' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'error.auth.passwordTooShort' });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'error.auth.nameTooShort' });
    }

    const captcha = await verifyCaptcha(captchaToken, 'signup');
    if (!captcha.success) return res.status(400).json({ error: 'error.auth.captchaFailed' });

    try {
      const ip = getClientIp(req);
      if (!(await assertNotBanned(db, res, { ip }))) return;

      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'error.auth.emailAlreadyUsed' });
      }

      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const code = generateSecurityCode();
      const codeHash = hashCode(code);
      const codeExpires = new Date(Date.now() + SECURITY_CODE_EXPIRY_MS);

      const user = {
        email,
        password: hashedPassword,
        name,
        type: USER_TYPES.USER,
        securityCode: codeHash,
        securityCodeExpires: codeExpires,
        securityCodeAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection('users').insertOne(user);

      const sending = sendSecurityCodeEmail(email, code, locale || 'en');
      if (!(await deliverEmail(res, sending))) return;

      logEvent(db, { event: 'user-signup', userId: user._id, ip, meta: { email } });

      res.json({ status: 'verification_pending', email });
    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({ error: 'error.auth.signupFailed' });
    }
  });
}
