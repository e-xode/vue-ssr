import { mail } from '#src/server/shared/email.mjs'
import { hash, rand } from '#src/server/shared/crypt.mjs'
import { log } from '#src/server/shared/log.mjs'

export default  async ({ data, db, socket  }) => {

    const { email, password, captcha } = data
    if (!captcha || !email || !password) {
        return socket.emit('auth', {
            status: 400,
            error: 'page.login.error.missing-fields'
        })
    }

    if (captcha !== socket.handshake.session.captcha) {
        return socket.emit('auth', {
            status: 400,
            error: 'page.login.error.captcha-incorrect'
        })
    }

    const user = await db.collection('user').findOne({ email })
    if (!user?._id) {
        return socket.emit('auth', {
            status: 400,
            error: 'page.login.error.user-not-found'
        })
    }

    const hashed = hash(password, user.salt)
    if (hashed !== user.password) {
        return socket.emit('auth', {
            status: 400,
            error: 'page.login.error.password-incorrect'
        })
    }

    const authcode = rand()
    socket.handshake.session.auth = {
        code: authcode,
        status: 'pending'
    }
    socket.handshake.session.user = {
        _id: user._id,
        email
    }
    socket.handshake.session.save()

    await mail('/app/src/server/templates/email/en/authcode.html', {
        authcode,
        to: email,
        subject: 'e-xode-vue-ssr-auth-code'
    })

    return socket.emit('auth', {
        ...socket.handshake.session.user,
        status: 200,
    })
}
