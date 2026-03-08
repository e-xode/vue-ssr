import { EMAIL_REGEX } from '#src/shared/const.js'
import { sendContactEmail } from '#src/shared/email.js'
import { logEvent } from '#src/shared/logger.js'
import { getClientIp } from '#src/shared/security.js'

export function setupContactRoute(app, db) {
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, message, locale } = req.body

      if (!name || !email || !message) {
        return res.status(400).json({ error: 'error.missingFields' })
      }

      if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: 'error.invalidEmail' })
      }

      if (message.length > 5000) {
        return res.status(400).json({ error: 'error.messageTooLong' })
      }

      const ip = getClientIp(req)
      const data = { name: name.trim(), email: email.trim().toLowerCase(), message: message.trim() }

      await sendContactEmail(data, locale || 'en')

      logEvent(db, { event: 'contact-sent', ip, meta: { name: data.name, email: data.email } })

      res.json({ status: 'ok' })
    } catch (err) {
      console.error('Contact send error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })
}
