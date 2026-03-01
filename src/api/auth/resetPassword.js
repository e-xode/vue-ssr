import bcrypt from 'bcryptjs'
import { verifyCode } from '#src/shared/email.js'
import { BCRYPT_ROUNDS, SECURITY_CODE_MAX_ATTEMPTS } from '#src/shared/const.js'
import { getClientIp } from '#src/shared/security.js'
import { logEvent } from '#src/shared/logger.js'

export function setupResetPasswordRoute(app, db) {
  app.post('/api/auth/reset-password', async (req, res) => {
    const { email, code, password } = req.body

    if (!email || !code || !password) {
      return res.status(400).json({ error: 'error.auth.allFieldsRequired' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'error.auth.passwordTooShort' })
    }

    try {
      const ip = getClientIp(req)
      const user = await db.collection('users').findOne({ email })

      if (!user || !user.resetPasswordPending) {
        return res.status(400).json({ error: 'error.auth.invalidResetRequest' })
      }

      if (!user.securityCode || !user.securityCodeExpires) {
        return res.status(400).json({ error: 'error.auth.codeExpired' })
      }

      if (new Date() > new Date(user.securityCodeExpires)) {
        return res.status(400).json({ error: 'error.auth.codeExpired' })
      }

      if ((user.securityCodeAttempts || 0) >= SECURITY_CODE_MAX_ATTEMPTS) {
        return res.status(400).json({ error: 'error.auth.tooManyAttempts' })
      }

      if (!verifyCode(user.securityCode, code)) {
        await db.collection('users').updateOne(
          { _id: user._id },
          { $inc: { securityCodeAttempts: 1 } }
        )
        logEvent(db, { event: 'auth-code-failed', userId: user._id, ip, meta: { reason: 'reset-password' } })
        return res.status(400).json({ error: 'error.auth.invalidCode' })
      }

      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS)

      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: { password: hashedPassword, updatedAt: new Date() },
          $unset: {
            securityCode: '',
            securityCodeExpires: '',
            securityCodeAttempts: '',
            resetPasswordPending: ''
          }
        }
      )

      logEvent(db, { event: 'user-reset-password', userId: user._id, ip })

      res.json({ status: 'ok' })
    } catch (err) {
      console.error('Reset password error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })
}
