import { log } from '#src/server/shared/log.mjs'
import socketCaptcha from '#src/server/socket/user/captcha.mjs'

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
                    return socketCaptcha({ data, db, socket })
            }
        })
    })
}
export {
    socket
}
