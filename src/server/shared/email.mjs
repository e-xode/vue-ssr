import fs from 'fs'
import mailer from 'nodemailer'
import mustache from 'mustache'
import { IS_PROD } from '#src/server/shared/constant.mjs'
import { log } from '#src/server/shared/log.mjs'

const mail = async(socket, template, data) => {
    const { locale = 'en' } = socket.handshake.session
    const htmltemplate = IS_PROD
        ? `/app/dist/src/server/templates/email/${locale}/${template}`
        : `/app/src/server/templates/email/${locale}/${template}`
    const jsonlocales = IS_PROD
        ? `/app/dist/src/translate/${locale}/${locale}.json`
        : `/app/src/translate/${locale}/${locale}.json`

    const html = fs.readFileSync(htmltemplate, 'utf-8')
    const locales = JSON.parse(fs.readFileSync(jsonlocales, 'utf-8'))

    const smtp = mailer.createTransport({
        host: process.env.MAILER_HOST,
        port: process.env.MAILER_PORT,
        secure: process.env.MAILER_SSL === 'true',
        auth: {
            user: process.env.MAILER_LOGIN,
            pass: process.env.MAILER_PASSWORD
        }
    })
    await smtp.sendMail({
        from: process.env.MAILER_FROM,
        to: data.to,
        subject: locales[data.subject],
        html: mustache.render(html, data)
    }).catch((err) => {
        log(`email error: ${err.toString()}`)
    })
}

export {
    mail
}
