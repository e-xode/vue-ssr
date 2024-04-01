import { omit } from 'ramda'
import { findUser } from '#src/server/db/index.mjs'
import { logindb } from '#src/server/shared/logindb.mjs'

export default  async ({ data, db, socket  }) => {

    const { user = {} } = socket.handshake.session
    const {
        code = null,
        route = null,
        status = null
    } = user

    if ([100,449].includes(status) && `${code}` === data.code) {
        const dbuser = await findUser({ db, _id: user._id })
        const newstatus = status === 100
            ? 200
            : 449
        socket.handshake.session.user = {
            ...omit(['password', 'orders', 'salt'], dbuser),
            route: null,
            status: newstatus
        }
        socket.handshake.session.save()
        await logindb({
            email: user.email,
            details: 'page.auth.success',
            event: 'user.auth',
            user: user._id,
            status: newstatus
        }, db)
        return socket.emit('user.auth', {
            ...omit(['password', 'salt'], dbuser),
            ...socket.handshake.session.user,
            route
        })
    }
    await logindb({
        email: user.email,
        details: 'page.auth.error.code-incorrect',
        event: 'user.auth',
        user: user._id,
        status: 400
    }, db)
    return socket.emit('user.auth', {
        status: 400,
        error: 'page.auth.error.code-incorrect'
    })
}
