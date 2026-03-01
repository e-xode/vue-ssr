import { requireAuth } from '../middleware.js'
import { EMAIL_REGEX, SECURITY_CODE_EXPIRY_MS, SECURITY_CODE_MAX_ATTEMPTS } from '#src/shared/const.js'
import { generateSecurityCode, hashCode, verifyCode, sendEmailChangeCodeEmail } from '#src/shared/email.js'
import { logEvent } from '#src/shared/logger.js'

export function setupChangeEmailRoute(app, db) {
  app.post('/api/auth/change-email', requireAuth, async (req, res) => {
    try {
      const { newEmail, locale } = req.body

      if (!newEmail || !EMAIL_REGEX.test(newEmail)) {
        return res.status(400).json({ error: 'error.invalidEmail' })
      }

      const normalizedEmail = newEmail.trim().toLowerCase()

      const user = await db.collection('users').findOne(
        { _id: req.userId },
        { projection: { email: 1 } }
      )

      if (normalizedEmail === user.email) {
        return res.status(400).json({ error: 'error.auth.sameEmail' })
      }

      const existing = await db.collection('users').findOne(
        { email: normalizedEmail },
        { projection: { _id: 1 } }
      )

      if (existing) {
        return res.status(409).json({ error: 'error.auth.emailAlreadyUsed' })
      }

      const code = generateSecurityCode()

      await db.collection('users').updateOne(
        { _id: req.userId },
        {
          $set: {
            pendingEmail: normalizedEmail,
            pendingEmailCode: hashCode(code),
            pendingEmailCodeExpires: new Date(Date.now() + SECURITY_CODE_EXPIRY_MS),
            pendingEmailCodeAttempts: 0
          }
        }
      )

      await sendEmailChangeCodeEmail(normalizedEmail, code, locale || 'en')

      logEvent(db, { event: 'user-change-email-request', userId: req.userId, ip: req.ip, meta: { newEmail: normalizedEmail } })

      res.json({ status: 'ok' })
    } catch (err) {
      console.error('Change email error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })

  app.post('/api/auth/verify-email-change', requireAuth, async (req, res) => {
    try {
      const { code } = req.body

      if (!code) {
        return res.status(400).json({ error: 'error.missingFields' })
      }

      const user = await db.collection('users').findOne(
        { _id: req.userId },
        { projection: { pendingEmail: 1, pendingEmailCode: 1, pendingEmailCodeExpires: 1, pendingEmailCodeAttempts: 1 } }
      )

      if (!user.pendingEmail || !user.pendingEmailCode) {
        return res.status(400).json({ error: 'error.auth.noPendingEmail' })
      }

      if (new Date() > user.pendingEmailCodeExpires) {
        await db.collection('users').updateOne(
          { _id: req.userId },
          { $unset: { pendingEmail: '', pendingEmailCode: '', pendingEmailCodeExpires: '', pendingEmailCodeAttempts: '' } }
        )
        return res.status(400).json({ error: 'error.auth.codeExpired' })
      }

      const attempts = (user.pendingEmailCodeAttempts || 0) + 1
      if (attempts > SECURITY_CODE_MAX_ATTEMPTS) {
        await db.collection('users').updateOne(
          { _id: req.userId },
          { $unset: { pendingEmail: '', pendingEmailCode: '', pendingEmailCodeExpires: '', pendingEmailCodeAttempts: '' } }
        )
        return res.status(429).json({ error: 'error.auth.tooManyAttempts' })
      }

      if (!verifyCode(user.pendingEmailCode, code)) {
        await db.collection('users').updateOne(
          { _id: req.userId },
          { $set: { pendingEmailCodeAttempts: attempts } }
        )
        return res.status(401).json({ error: 'error.auth.invalidCode', attempts: SECURITY_CODE_MAX_ATTEMPTS - attempts })
      }

      const existing = await db.collection('users').findOne(
        { email: user.pendingEmail },
        { projection: { _id: 1 } }
      )

      if (existing) {
        await db.collection('users').updateOne(
          { _id: req.userId },
          { $unset: { pendingEmail: '', pendingEmailCode: '', pendingEmailCodeExpires: '', pendingEmailCodeAttempts: '' } }
        )
        return res.status(409).json({ error: 'error.auth.emailAlreadyUsed' })
      }

      await db.collection('users').updateOne(
        { _id: req.userId },
        {
          $set: { email: user.pendingEmail },
          $unset: { pendingEmail: '', pendingEmailCode: '', pendingEmailCodeExpires: '', pendingEmailCodeAttempts: '' }
        }
      )

      logEvent(db, { event: 'user-change-email-verified', userId: req.userId, ip: req.ip, meta: { newEmail: user.pendingEmail } })

      res.json({ status: 'ok', email: user.pendingEmail })
    } catch (err) {
      console.error('Verify email change error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })
}
