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

export async function sendWelcomeEmail(email, name, locale = 'en') {
  const template = getTemplate('welcome', locale)
  if (!template) return { success: true }
  const subject = typeof template.subject === 'function' ? template.subject(name) : template.subject
  return sendMail(email, subject, template.html(name))
}

export async function sendContactEmail(data, locale = 'en') {
  const template = getTemplate('contact', locale)
  if (!template) return { success: true }
  const to = process.env.MAILER_TO || process.env.MAILER_FROM
  const subject = typeof template.subject === 'function' ? template.subject(data) : template.subject
  return sendMail(to, subject, template.html(data))
}

export function generateSecurityCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function hashCode(code) {
  return Buffer.from(code).toString('base64')
}

export function verifyCode(code, hash) {
  return hashCode(code) === hash
}
