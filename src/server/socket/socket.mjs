import captcha from '#src/server/socket/user/captcha.mjs'
import login from '#src/server/socket/user/login.mjs'
import me from '#src/server/socket/user/me.mjs'
import register from '#src/server/socket/user/register.mjs'
import { log } from '#src/server/shared/log.mjs'

const socket = ({ io, db }) => {
    io.on('disconnect', (socket) => {
        log(`socket:${socket.handshake.session.id} close`)
        socket.removeAllListeners()
    })

    io.on('connection', (socket) => {
        log(`socket:${socket.handshake.session.id} open`)
        socket.removeAllListeners()
        socket.handshake.session.updatedAt = new Date()
        socket.handshake.session.save()
        socket.onAny((message, data) => {
            log(`socket:${socket.handshake.session.id} msg=${message}`)
            switch(message) {
                case 'captcha':
                    return captcha({ data, db, socket })
                case 'login':
                    return login({ data, db, socket })
                case 'me':
                    return me({ data, db, socket })
                case 'register':
                    return register({ data, db, socket })
            }
        })
    })
}
export {
    socket
}
