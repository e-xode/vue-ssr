import { EMAIL_REGEX } from '#src/shared/const.js'
import { sendContactEmail } from '#src/shared/email.js'
import { logEvent } from '#src/shared/logger.js'
import { getClientIp } from '#src/shared/security.js'
import { verifyCaptcha } from '#src/shared/captcha.js'
import { escapeHtml } from '#src/shared/utils.js'

export function setupContactRoute(app, db) {
  app.post('/api/contact', async (req, res) => {
    try {
      const name = escapeHtml(req.body.name?.trim() || '')
      const email = req.body.email?.trim().toLowerCase() || ''
      const message = escapeHtml(req.body.message?.trim() || '')
      const locale = req.body.locale
      const { captchaToken } = req.body

      if (!name || !email || !message) {
        return res.status(400).json({ error: 'error.missingFields' })
      }

      if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: 'error.invalidEmail' })
      }

      const captcha = await verifyCaptcha(captchaToken, 'contact')
      if (!captcha.success) {
        return res.status(400).json({ error: 'error.captcha.failed' })
      }

      if (message.length > 5000) {
        return res.status(400).json({ error: 'error.messageTooLong' })
      }

      const ip = getClientIp(req)
      const data = { name, email, message }

      await sendContactEmail(data, locale || 'en')

      logEvent(db, { event: 'contact-sent', ip, meta: { name: data.name, email: data.email } })

      res.json({ status: 'ok' })
    } catch (err) {
      console.error('Contact send error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })
}
