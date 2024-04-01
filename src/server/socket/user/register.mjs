import { mail } from '#src/server/shared/email.mjs'
import { hash, rand, salt } from '#src/server/shared/crypt.mjs'
import { logindb } from '#src/server/shared/logindb.mjs'

export default async ({ data, db, socket  }) => {

    const { email, captcha, password, route } = data
    if (!captcha || !email || !password) {
        await logindb({
            email: email || socket.session.id,
            details: 'page.register.error.missing-fields',
            event: 'user.register',
            status: 400
        }, db)
        return socket.emit('user.auth', {
            status: 400,
            error: 'page.register.error.missing-fields'
        })
    }

    if (captcha !== socket.handshake.session.captcha) {
        await logindb({
            email,
            details: 'page.register.error.captcha-incorrect',
            event: 'user.register',
            status: 400
        }, db)
        return socket.emit('user.auth', {
            status: 400,
            error: 'page.register.error.captcha-incorrect'
        })
    }

    const check = await db.collection('user').findOne({ email })
    if (check?._id) {
        await logindb({
            email,
            details: 'page.register.error.email-already-exists',
            event: 'user.register',
            status: 400
        }, db)
        return socket.emit('user.auth', {
            status: 400,
            error: 'page.register.error.email-already-exists'
        })
    }

    const createAt = new Date(Date.now())
    const salted = salt()
    await db.collection('user').insertOne({
        ...data,
        createAt,
        hash,
        password: hash(password, salted),
        salt: salted
    })

    const { _id } = await db.collection('user').findOne({ email })
    if (!_id) {
        await logindb({
            email,
            details: 'page.register.error.user-not-created',
            event: 'user.register',
            status: 500
        }, db)
        return socket.emit('user.auth', {
            status: 500,
            error: 'page.register.error.user-not-created'
        })
    }

    const authcode = rand()
    socket.handshake.session.user = {
        _id,
        code: authcode,
        email,
        route,
        status: 100
    }
    socket.handshake.session.save()

    await logindb({
        email,
        details: 'page.register.email-authentication-code',
        event: 'user.register',
        user: _id,
        status: 100
    }, db)

    await mail(socket, 'authcode.html', {
        authcode,
        to: email,
        subject: 'app.email.authcode'
    })

    socket.emit('user.auth', {
        ...socket.handshake.session.user,
        status: 100
    })

}
