import bcrypt from 'bcryptjs'
import { sendSecurityCodeEmail, generateSecurityCode, hashCode } from '#src/shared/email.js'
import { USER_TYPES, SECURITY_CODE_EXPIRY_MS, BCRYPT_ROUNDS } from '#src/shared/const.js'
import { getClientIp } from '#src/shared/security.js'
import { logEvent } from '#src/shared/logger.js'

export function setupSignupRoute(app, db) {
  app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'error.auth.missingFields' })
    }

    try {
      const ip = getClientIp(req)

      const existingUser = await db.collection('users').findOne({ email })
      if (existingUser) {
        return res.status(400).json({ error: 'error.auth.emailAlreadyUsed' })
      }

      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS)
      const code = generateSecurityCode()
      const codeHash = hashCode(code)
      const codeExpires = new Date(Date.now() + SECURITY_CODE_EXPIRY_MS)

      const user = {
        email,
        password: hashedPassword,
        name,
        type: USER_TYPES.USER,
        securityCode: codeHash,
        securityCodeExpires: codeExpires,
        securityCodeAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.collection('users').insertOne(user)

      await sendSecurityCodeEmail(email, code)

      logEvent(db, { event: 'user-signup', userId: user._id, ip, meta: { email } })

      res.json({ status: 'verification_pending', email })
    } catch (err) {
      console.error('Signup error:', err)
      res.status(500).json({ error: 'error.auth.signupFailed' })
    }
  })
}
