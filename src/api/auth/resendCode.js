import { sendSecurityCodeEmail, generateSecurityCode, hashCode } from '#src/shared/email.js'
import { SECURITY_CODE_EXPIRY_MS, RESEND_COOLDOWN_MS } from '#src/shared/const.js'
import { logEvent } from '#src/shared/logger.js'

export function setupResendCodeRoute(app, db) {
  app.post('/api/auth/resend-code', async (req, res) => {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'error.auth.emailRequired' })
    }

    try {
      const user = await db.collection('users').findOne({ email })
      if (!user) {
        return res.status(400).json({ error: 'error.auth.userNotFound' })
      }

      if (user.securityCodeExpires) {
        const elapsed = Date.now() - (new Date(user.securityCodeExpires).getTime() - SECURITY_CODE_EXPIRY_MS)
        if (elapsed < RESEND_COOLDOWN_MS) {
          return res.status(429).json({ error: 'error.auth.resendTooSoon' })
        }
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

      logEvent(db, { event: 'auth-code-resent', userId: user._id, ip: req.ip, meta: { email } })

      res.json({ status: 'code_sent', email })
    } catch (err) {
      console.error('Resend code error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })
}
