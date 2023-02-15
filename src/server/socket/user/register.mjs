import { mail } from '#src/server/shared/email.mjs'
import { hash, rand, salt } from '#src/server/shared/crypt.mjs'

export default async ({ data, db, socket  }) => {

    const { email, password, captcha } = data
    if (!captcha || !email || !password) {
        return socket.emit('auth', {
            status: 400,
            error: 'page.register.error.missing-fields'
        })
    }

    if (captcha !== socket.handshake.session.captcha) {
        return socket.emit('auth', {
            status: 400,
            error: 'page.register.error.captcha-incorrect'
        })
    }

    const check = await db.collection('user').findOne({ email })
    if (check?._id) {
        return socket.emit('auth', {
            status: 400,
            error: 'page.register.error.email-already-exists'
        })
    }

    const createAt = new Date(Date.now())
    const salted = salt()
    await db.collection('user').insertOne({
        createAt,
        email,
        hash,
        password: hash(password, salted),
        salt: salted
    })

    const { _id } = await db.collection('user').findOne({ email })
    if (!_id) {
        return socket.emit('auth', {
            status: 500,
            error: 'page.register.error.user-not-created'
        })
    }
    socket.handshake.session.auth = {
        code: rand(),
        status: 'pending'
    }
    socket.handshake.session.user = {
        _id,
        auth: 'pending',
        email
    }
    socket.handshake.session.save()

    return socket.emit('auth', {
        ...socket.handshake.session.user,
        status: 200,
    })

}
