import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import { sendSecurityCodeEmail, generateSecurityCode, hashCode } from '#src/shared/email.js'

export function setupSignupRoute(app, db) {
  app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'error.auth.missingFields' })
    }

    try {
      const existingUser = await db.collection('users').findOne({ email })
      if (existingUser) {
        return res.status(400).json({ error: 'error.auth.emailAlreadyUsed' })
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const code = await generateSecurityCode()
      const codeHash = hashCode(code)
      const codeExpires = new Date(Date.now() + 10 * 60 * 1000)

      const user = {
        email,
        password: hashedPassword,
        name,
        securityCode: codeHash,
        securityCodeExpires: codeExpires,
        securityCodeAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await db.collection('users').insertOne(user)

      await sendSecurityCodeEmail(email, code)

      res.json({ status: 'verification_pending', email })
    } catch (err) {
      console.error('Signup error:', err)
      res.status(500).json({ error: 'error.auth.signupFailed' })
    }
  })
}
