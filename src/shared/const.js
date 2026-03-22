export const BCRYPT_ROUNDS = 10

export const SECURITY_CODE_EXPIRY_MS = 10 * 60 * 1000

export const SECURITY_CODE_MAX_ATTEMPTS = 3

export const RESEND_COOLDOWN_MS = 30 * 1000

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
  loginHistory: 0
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const USER_TYPES = {
  USER: 'user',
  ADMIN: 'admin'
}

export const SUPPORTED_LOCALES = [
  { code: 'en', intl: 'en-US', og: 'en_US', label: 'English', flag: 'gb' },
  { code: 'fr', intl: 'fr-FR', og: 'fr_FR', label: 'Français', flag: 'fr' }
]

export const DEFAULT_LOCALE = 'en'

export const LOCALE_CODES = SUPPORTED_LOCALES.map(l => l.code)

export const LOCALE_ROUTE_REGEX = LOCALE_CODES.join('|')

export function getIntlLocale(locale) {
  const found = SUPPORTED_LOCALES.find(l => l.code === locale)
  return found ? found.intl : 'en-US'
}

export function getOgLocale(locale) {
  const found = SUPPORTED_LOCALES.find(l => l.code === locale)
  return found ? found.og : 'en_US'
}

export function isAdmin(user) {
  return user?.type === USER_TYPES.ADMIN
}
