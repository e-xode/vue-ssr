export const BCRYPT_ROUNDS = 10

export const SECURITY_CODE_EXPIRY_MS = 10 * 60 * 1000

export const SECURITY_CODE_MAX_ATTEMPTS = 3

export const RESEND_COOLDOWN_MS = 30 * 1000

export const USER_SAFE_PROJECTION = { password: 0 }

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const USER_TYPES = {
  USER: 'user',
  ADMIN: 'admin'
}

export const SUPPORTED_LOCALES = [
  { code: 'en', intl: 'en-US', og: 'en_US', label: 'English', flag: 'gb' },
  { code: 'fr', intl: 'fr-FR', og: 'fr_FR', label: 'Français', flag: 'fr' }
]

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
  return user?.type === 'admin'
}
