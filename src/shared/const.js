export const SESSION_COOKIE_NAME = 'app.sid';

export const SESSION_COOKIE_BASE_OPTIONS = {
  sameSite: 'lax',
  httpOnly: true,
  path: '/',
};

export const SESSION_ABSOLUTE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export const SESSION_DIR = 'logs/sessions';

export const SESSION_FILE_CONCURRENCY = 20;

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const AVATAR_MIME_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const AVATAR_UPLOAD_ERRORS = {
  LIMIT_FILE_SIZE: { status: 413, error: 'error.avatar.tooLarge' },
  LIMIT_UNEXPECTED_TYPE: { status: 415, error: 'error.avatar.invalidType' },
  LIMIT_FILE_COUNT: { status: 400, error: 'error.validation' },
  LIMIT_UNEXPECTED_FILE: { status: 400, error: 'error.validation' },
};

export const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

export const DEFAULT_LOG_LEVEL = 'info';

export const LIST_LOGS_DEFAULT_LIMIT = 50;

export const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
};

export const BCRYPT_ROUNDS = 10;

export const SECURITY_CODE_EXPIRY_MS = 10 * 60 * 1000;

export const SECURITY_CODE_MAX_ATTEMPTS = 3;

export const RESEND_COOLDOWN_MS = 30 * 1000;

export const USER_SAFE_PROJECTION = {
  password: 0,
  securityCode: 0,
  securityCodeHash: 0,
  securityCodeExpires: 0,
  securityCodeAttempts: 0,
  emailChangeCode: 0,
  emailChangeHash: 0,
  emailChangeExpires: 0,
  emailChangeTo: 0,
  resetPasswordCode: 0,
  resetPasswordHash: 0,
  resetPasswordExpires: 0,
  loginHistory: 0,
};

export const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,63}$/;

export const USER_TYPES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const SUPPORTED_LOCALES = [
  { code: 'en', intl: 'en-US', og: 'en_US', label: 'English', flag: 'gb' },
  { code: 'fr', intl: 'fr-FR', og: 'fr_FR', label: 'Français', flag: 'fr' },
];

export const DEFAULT_LOCALE = 'en';

export const LOCALE_CODES = SUPPORTED_LOCALES.map((l) => l.code);

export const LOCALE_ROUTE_REGEX = LOCALE_CODES.join('|');

export function getIntlLocale(locale) {
  const found = SUPPORTED_LOCALES.find((l) => l.code === locale);
  return found ? found.intl : 'en-US';
}

export function getOgLocale(locale) {
  const found = SUPPORTED_LOCALES.find((l) => l.code === locale);
  return found ? found.og : 'en_US';
}

export function isAdmin(user) {
  return user?.type === USER_TYPES.ADMIN;
}
