import bcrypt from 'bcryptjs'
import { sendSecurityCodeEmail, generateSecurityCode, hashCode } from '#src/shared/email.js'
import { SECURITY_CODE_EXPIRY_MS, EMAIL_REGEX } from '#src/shared/const.js'
import { getClientIp, isIpBlocked } from '#src/shared/security.js'
import { logEvent } from '#src/shared/logger.js'

export function setupSigninRoute(app, db) {
  app.post('/api/auth/signin', async (req, res) => {
    const email = req.body.email?.trim().toLowerCase()
    const { password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'error.auth.emailAndPasswordRequired' })
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'error.validation.invalidEmail' })
    }

    try {
      const ip = getClientIp(req)

      if (await isIpBlocked(db, ip)) {
        logEvent(db, { event: 'auth-failed', ip, meta: { email, reason: 'ip-blocked' } })
        return res.status(403).json({ error: 'error.auth.blocked' })
      }

      const user = await db.collection('users').findOne({ email })
      if (!user) {
        logEvent(db, { event: 'auth-failed', ip, meta: { email, reason: 'user-not-found' } })
        return res.status(401).json({ error: 'error.auth.invalidCredentials' })
      }

      if (user.isBlocked) {
        logEvent(db, { event: 'auth-failed', userId: user._id, ip, meta: { email, reason: 'user-blocked' } })
        return res.status(403).json({ error: 'error.auth.blocked' })
      }

      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        logEvent(db, { event: 'auth-failed', userId: user._id, ip, meta: { email, reason: 'invalid-password' } })
        return res.status(401).json({ error: 'error.auth.invalidCredentials' })
      }

      const code = generateSecurityCode()
      const codeHash = hashCode(code)
      const codeExpires = new Date(Date.now() + SECURITY_CODE_EXPIRY_MS)

      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: {
            securityCode: codeHash,
            securityCodeExpires: codeExpires,
            securityCodeAttempts: 0
          }
        }
      )

      await sendSecurityCodeEmail(email, code)

      logEvent(db, { event: 'user-signin', userId: user._id, ip, meta: { email } })

      res.json({ status: 'verification_pending', email })
    } catch (err) {
      console.error('Signin error:', err)
      res.status(500).json({ error: 'error.auth.signinFailed' })
    }
  })
}
