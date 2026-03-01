import { generateSecurityCode, hashCode, sendResetPasswordEmail } from '#src/shared/email.js'
import { SECURITY_CODE_EXPIRY_MS } from '#src/shared/const.js'
import { getClientIp } from '#src/shared/security.js'
import { logEvent } from '#src/shared/logger.js'

export function setupForgotPasswordRoute(app, db) {
  app.post('/api/auth/forgot-password', async (req, res) => {
    const { email, locale } = req.body
    if (!email) return res.status(400).json({ error: 'error.auth.emailRequired' })

    try {
      const ip = getClientIp(req)
      const user = await db.collection('users').findOne({ email })

      if (!user) {
        logEvent(db, { event: 'user-forgot-password', ip, meta: { email, found: false } })
        return res.json({ status: 'sent' })
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
            securityCodeAttempts: 0,
            resetPasswordPending: true
          }
        }
      )

      await sendResetPasswordEmail(email, code, locale || user.locale || 'en')

      logEvent(db, { event: 'user-forgot-password', userId: user._id, ip, meta: { email } })

      res.json({ status: 'sent' })
    } catch (err) {
      console.error('Forgot password error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })
}
