import fs from 'fs'
import mailer from 'nodemailer'
import mustache from 'mustache'
import { log } from '#src/server/shared/log.mjs'

const mail = async(file, data) => {
    const template = fs.readFileSync(file, 'utf-8')
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
        subject: data.subject,
        html: mustache.render(template, data)
    }).catch((err) => {
        log(err.toString())
    })
}

export {
    mail
}
