import { omit } from 'ramda'
import bcrypt from 'bcrypt'
import { logindb } from '#src/server/shared/logindb.mjs'
import { rand } from '#src/server/shared/crypt.mjs'
import { mail } from '#src/server/shared/email.mjs'

export default  async ({ data, db, socket  }) => {

    const { captcha, email, password, route  } = data
    if (!captcha || !email || !password) {
        await logindb({
            email: email || socket.handshake.session.id,
            details: 'page.login.error.missing-fields',
            event: 'user.login',
            status: 400
        }, db)
        return socket.emit('user.auth', {
            status: 400,
            error: 'page.login.error.missing-fields'
        })
    }

    if (captcha !== socket.handshake.session.captcha) {
        await logindb({
            email,
            details: 'page.login.error.captcha-incorrect',
            event: 'user.login',
            status: 400
        }, db)
        return socket.emit('user.auth', {
            status: 400,
            error: 'page.login.error.captcha-incorrect'
        })
    }

    const user = await db.collection('user').findOne({ email })
    if (!user?._id) {
        await logindb({
            email,
            details: 'page.login.error.user-not-found',
            event: 'user.login',
            status: 400
        }, db)
        return socket.emit('user.auth', {
            status: 400,
            error: 'page.login.error.user-not-found'
        })
    }

    if (!bcrypt.compareSync(password, user.password)) {
        await logindb({
            email,
            details: 'page.login.error.password-incorrect',
            event: 'user.login',
            status: 400
        }, db)
        return socket.emit('user.auth', {
            status: 400,
            error: 'page.login.error.password-incorrect'
        })
    }

    const authcode = rand()
    socket.handshake.session.user = {
        ...omit(['password', 'salt'], user),
        code: authcode,
        route,
        status: 100
    }
    socket.handshake.session.save()

    await logindb({
        email,
        details: 'page.login.email-authentication-code',
        event: 'user.login',
        status: 100
    }, db)

    await mail(socket, 'authcode.html', {
        authcode,
        to: email,
        subject: 'app.email.authcode'
    })

    socket.emit('user.auth', {
        ...omit(['password', 'salt'], user),
        route,
        status: 100
    })
}
