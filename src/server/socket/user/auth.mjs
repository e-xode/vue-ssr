import { log } from '#src/server/shared/log.mjs'

export default  async ({ data, db, socket  }) => {

    const { auth = {}, user = {} } = socket.handshake.session
    const { _id = null, email = null } = user

    if (auth.status === 'pending' && `${auth.code}` === data.code) {
        socket.handshake.session.auth.status = 'success'
        socket.handshake.session.save()
        return socket.emit('auth', {
            _id,
            email,
            status: 200,
        })
    } else {
        return socket.emit('auth', {
            status: 400,
            error: 'page.auth.error.code-incorrect'
        })
    }
}
