import { verifyCode } from '#src/shared/email.js'

export function setupVerifyCodeRoute(app, db) {
  app.post('/api/auth/verify-code', async (req, res) => {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ error: 'error.auth.missingFields' })
    }

    try {
      const user = await db.collection('users').findOne({ email })
      if (!user) {
        return res.status(400).json({ error: 'error.auth.userNotFound' })
      }

      if (!user.securityCode || new Date() > user.securityCodeExpires) {
        return res.status(400).json({ error: 'error.auth.codeExpired' })
      }

      if (user.securityCodeAttempts >= 5) {
        return res.status(400).json({ error: 'error.auth.tooManyAttempts' })
      }

      const isValid = verifyCode(code, user.securityCode)
      if (!isValid) {
        await db.collection('users').updateOne(
          { _id: user._id },
          { $inc: { securityCodeAttempts: 1 } }
        )
        return res.status(400).json({ error: 'error.auth.invalidCode' })
      }

      req.session.userId = user._id.toString()

      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $unset: {
            securityCode: '',
            securityCodeExpires: '',
            securityCodeAttempts: ''
          },
          $set: { updatedAt: new Date() }
        }
      )

      const updatedUser = await db.collection('users').findOne(
        { _id: user._id },
        { projection: { password: 0 } }
      )

      res.json({ user: updatedUser })
    } catch (err) {
      console.error('Verify code error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })
}
