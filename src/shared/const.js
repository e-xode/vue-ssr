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
