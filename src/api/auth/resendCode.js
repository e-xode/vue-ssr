import { sendSecurityCodeEmail, generateSecurityCode, hashCode } from '#src/shared/email.js'
import { SECURITY_CODE_EXPIRY_MS } from '#src/shared/const.js'

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

      res.json({ status: 'code_sent', email })
    } catch (err) {
      console.error('Resend code error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })
}
