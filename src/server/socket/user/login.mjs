import { log } from '#src/server/shared/log.mjs'
import { hash } from '#src/server/shared/crypt.mjs'

export default  async ({ data, db, socket  }) => {

    const { email, password, captcha } = data
    if (!captcha || !email || !password) {
        return socket.emit('login', {
            status: 400,
            error: 'page.login.error.missing-fields'
        })
    }
    log(`captcha check ${captcha}/${socket.handshake.session.captcha}`)
    if (captcha !== socket.handshake.session.captcha) {
        return socket.emit('login', {
            status: 400,
            error: 'page.login.error.captcha-incorrect'
        })
    }

    const user = await db.collection('user').findOne({ email })
    if (!user?._id) {
        return socket.emit('login', {
            status: 400,
            error: 'page.login.error.user-not-found'
        })
    }

    const hashed = hash(password, user.salt)
    if (hashed !== user.password) {
        return socket.emit('login', {
            status: 400,
            error: 'page.login.error.password-incorrect'
        })
    }

    socket.handshake.session.user = {
        _id: user._id,
        email
    }
    socket.handshake.session.save()
    return socket.emit('login', {
        ...socket.handshake.session.user,
        status: 200,
    })
}
