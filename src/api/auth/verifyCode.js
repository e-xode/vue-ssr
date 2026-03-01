import { verifyCode } from '#src/shared/email.js'
import { SECURITY_CODE_MAX_ATTEMPTS, USER_SAFE_PROJECTION } from '#src/shared/const.js'
import { getClientIp, isIpBlocked, recordLoginIp } from '#src/shared/security.js'
import { logEvent } from '#src/shared/logger.js'

export function setupVerifyCodeRoute(app, db) {
  app.post('/api/auth/verify-code', async (req, res) => {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ error: 'error.auth.emailAndCodeRequired' })
    }

    try {
      const ip = getClientIp(req)

      if (await isIpBlocked(db, ip)) {
        return res.status(403).json({ error: 'error.auth.blocked' })
      }

      const user = await db.collection('users').findOne({ email })
      if (!user) {
        return res.status(401).json({ error: 'error.auth.emailNotFound' })
      }

      if (user.isBlocked) {
        return res.status(403).json({ error: 'error.auth.blocked' })
      }

      if (!user.securityCode || !user.securityCodeExpires) {
        return res.status(400).json({ error: 'error.auth.noVerificationPending' })
      }

      if (new Date() > user.securityCodeExpires) {
        await db.collection('users').updateOne(
          { _id: user._id },
          { $unset: { securityCode: '', securityCodeExpires: '' } }
        )
        return res.status(400).json({ error: 'error.auth.codeExpired' })
      }

      const attempts = (user.securityCodeAttempts || 0) + 1
      if (attempts > SECURITY_CODE_MAX_ATTEMPTS) {
        await db.collection('users').updateOne(
          { _id: user._id },
          { $unset: { securityCode: '', securityCodeExpires: '' } }
        )
        logEvent(db, { event: 'auth-code-failed', userId: user._id, ip, meta: { email, reason: 'too-many-attempts' } })
        return res.status(429).json({ error: 'error.auth.tooManyAttempts' })
      }

      const isValid = verifyCode(user.securityCode, code)
      if (!isValid) {
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: { securityCodeAttempts: attempts } }
        )
        logEvent(db, { event: 'auth-code-failed', userId: user._id, ip, meta: { email, reason: 'invalid-code' } })
        return res.status(401).json({ error: 'error.auth.invalidCode', attempts: SECURITY_CODE_MAX_ATTEMPTS - attempts })
      }

      await db.collection('users').updateOne(
        { _id: user._id },
        { $unset: { securityCode: '', securityCodeExpires: '', securityCodeAttempts: '' } }
      )

      await recordLoginIp(db, user._id, ip)

      req.session.userId = user._id.toString()
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      const verifiedUser = await db.collection('users').findOne(
        { _id: user._id },
        { projection: USER_SAFE_PROJECTION }
      )

      logEvent(db, { event: 'auth-code-verified', userId: user._id, ip, meta: { email } })

      res.json({ status: 'verified', user: verifiedUser })
    } catch (err) {
      console.error('Verify code error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })
}
