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

    socket.handshake.session.email = email
    socket.handshake.session.save()
    return socket.emit('login', {
        _id: user._id,
        status: 200,
    })
}
