import bcrypt from 'bcryptjs'
import { sendSecurityCodeEmail, generateSecurityCode, hashCode } from '#src/shared/email.js'
import { SECURITY_CODE_EXPIRY_MS } from '#src/shared/const.js'

export function setupSigninRoute(app, db) {
  app.post('/api/auth/signin', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'error.auth.emailAndPasswordRequired' })
    }

    try {
      const user = await db.collection('users').findOne({ email })
      if (!user) {
        return res.status(401).json({ error: 'error.auth.invalidCredentials' })
      }

      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
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

      res.json({ status: 'verification_pending', email })
    } catch (err) {
      console.error('Signin error:', err)
      res.status(500).json({ error: 'error.auth.signinFailed' })
    }
  })
}
