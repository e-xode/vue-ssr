import nodemailer from 'nodemailer'
import { emailTemplates as frTemplates } from '#src/translate/emails/fr.js'
import { emailTemplates as enTemplates } from '#src/translate/emails/en.js'

const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: parseInt(process.env.MAILER_PORT || '587'),
  secure: process.env.MAILER_SSL === 'true',
  auth: {
    user: process.env.MAILER_LOGIN,
    pass: process.env.MAILER_PASSWORD
  }
})

const templates = { fr: frTemplates, en: enTemplates }

function getTemplate(templateName, locale = 'en') {
  const lang = templates[locale] ? locale : 'en'
  return templates[lang][templateName]
}

async function sendMail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: process.env.MAILER_FROM,
      to,
      subject,
      html
    })
    return { success: true }
  } catch (err) {
    console.error('Email send error:', err)
    return { success: false, error: err.message }
  }
}

export async function sendSecurityCodeEmail(email, code, locale = 'en') {
  const template = getTemplate('securityCode', locale)
  return sendMail(email, template.subject, template.html(code))
}

export async function generateSecurityCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function hashCode(code) {
  return Buffer.from(code).toString('base64')
}

export function verifyCode(code, hash) {
  return hashCode(code) === hash
}
