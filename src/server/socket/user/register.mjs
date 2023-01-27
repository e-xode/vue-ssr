import { log } from '#src/server/shared/log.mjs'
import {
    hash,
    salt,
    tokenize
} from '#src/server/shared/crypt.mjs'

export default async ({ data, db, socket  }) => {

    const { email, password, captcha } = data
    if (!captcha || !email || !password) {
        return socket.emit('register', {
            status: 400,
            error: 'page.register.error.missing-fields'
        })
    }

    const check = await db.collection('user').findOne({ email })
    if (check?._id) {
        return socket.emit('register', {
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
        salt: salted,
        token: tokenize()
    })

    const { _id } = await db.collection('user').findOne({ email })
    if (!_id) {
        return socket.emit('register', {
            status: 500,
            error: 'page.register.error.user-not-created'
        })
    }

    socket.handshake.session.email = email
    socket.handshake.session.save()
    return socket.emit('register', {
        _id,
        status: 201,
    })

}