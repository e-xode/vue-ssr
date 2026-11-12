import nodemailer from 'nodemailer';
import { randomInt, createHash, timingSafeEqual } from 'node:crypto';
import { emailTemplates as frTemplates } from '#src/translate/emails/fr.js';
import { emailTemplates as enTemplates } from '#src/translate/emails/en.js';
import { logInfo, logWarn } from '#src/shared/log.js';

const DEV_MAIL_SCOPE = 'mail:dev';

export function isDevMailMode(env = process.env) {
  return env.NODE_ENV !== 'production' && !env.MAILER_HOST;
}

export function createMailTransport(env = process.env) {
  if (isDevMailMode(env)) {
    logWarn('MAILER_HOST is not set: emails are logged to the console', DEV_MAIL_SCOPE);
    return nodemailer.createTransport({ jsonTransport: true });
  }
  return nodemailer.createTransport({
    host: env.MAILER_HOST,
    port: parseInt(env.MAILER_PORT || '587'),
    secure: env.MAILER_SSL === 'true',
    auth: {
      user: env.MAILER_LOGIN,
      pass: env.MAILER_PASSWORD,
    },
  });
}

const devMailMode = isDevMailMode();
const transporter = createMailTransport();

const templates = { fr: frTemplates, en: enTemplates };

function getTemplate(templateName, locale = 'en') {
  const lang = templates[locale] ? locale : 'en';
  return templates[lang][templateName];
}

async function sendMail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: process.env.MAILER_FROM,
      to,
      subject,
      html,
    });
    if (devMailMode) logInfo(`to=${to} subject="${subject}"`, DEV_MAIL_SCOPE);
    return { success: true };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: err.message };
  }
}

function logDevCode(email, code) {
  if (devMailMode) logInfo(`code for ${email}: ${code}`, DEV_MAIL_SCOPE);
}

async function sendCodeEmail(templateName, email, code, locale) {
  const template = getTemplate(templateName, locale);
  const result = await sendMail(email, template.subject, template.html(code));
  logDevCode(email, code);
  return result;
}

export async function sendSecurityCodeEmail(email, code, locale = 'en') {
  return sendCodeEmail('securityCode', email, code, locale);
}

export async function sendContactEmail(data, locale = 'en') {
  const template = getTemplate('contact', locale);
  if (!template) return { success: true };
  const to = process.env.MAILER_TO || process.env.MAILER_FROM;
  const subject =
    typeof template.subject === 'function' ? template.subject(data) : template.subject;
  return sendMail(to, subject, template.html(data));
}

export async function sendEmailChangeCodeEmail(email, code, locale = 'en') {
  return sendCodeEmail('emailChangeCode', email, code, locale);
}

export async function sendResetPasswordEmail(email, code, locale = 'en') {
  return sendCodeEmail('resetPassword', email, code, locale);
}

export function generateSecurityCode() {
  return randomInt(100000, 1000000).toString();
}

export function hashCode(code) {
  return createHash('sha256').update(code).digest('hex');
}

export function verifyCode(storedHash, providedCode) {
  if (typeof storedHash !== 'string' || typeof providedCode !== 'string') return false;
  const stored = Buffer.from(storedHash);
  const provided = Buffer.from(hashCode(providedCode));
  if (stored.length !== provided.length) return false;
  return timingSafeEqual(stored, provided);
}
