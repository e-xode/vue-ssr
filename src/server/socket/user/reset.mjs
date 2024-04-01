import { mail } from '#src/server/shared/email.mjs'
import { rand } from '#src/server/shared/crypt.mjs'
import { logindb } from '#src/server/shared/logindb.mjs'

export default async ({ data, db, socket  }) => {

    const { email, captcha, route } = data
    if (!captcha || !email) {
        await logindb({
            email: email || socket.session.id,
            details: 'page.reset-password.error.missing-fields',
            event: 'user.reset-password',
            status: 400
        }, db)
        return socket.emit('user.auth', {
            status: 400,
            error: 'page.reset-password.error.missing-fields'
        })
    }

    if (captcha !== socket.handshake.session.captcha) {
        await logindb({
            email,
            details: 'page.reset-password.error.captcha-incorrect',
            event: 'user.reset-password',
            status: 400
        }, db)
        return socket.emit('user.auth', {
            status: 400,
            error: 'page.reset-password.error.captcha-incorrect'
        })
    }

    const user = await db.collection('user').findOne({ email })
    if (!user?._id) {
        await logindb({
            email,
            details: 'page.reset-password.error.user-not-found',
            event: 'user.reset-password',
            status: 400
        }, db)
        return socket.emit('user.auth', {
            status: 400,
            error: 'page.reset-password.error.user-not-found'
        })
    }

    const authcode = rand()
    socket.handshake.session.user = {
        _id: user._id,
        code: authcode,
        email,
        route,
        status: 449
    }
    socket.handshake.session.save()

    await mail(socket, 'authcode.html', {
        authcode,
        to: email,
        subject: 'app.email.authcode'
    })

    await logindb({
        email: user.email,
        details: 'page.auth.email-authentication-code',
        event: 'user.auth',
        user: user._id,
        status: 449
    }, db)

    socket.emit('user.auth', {
        ...socket.handshake.session.user,
        status: 449
    })
}
