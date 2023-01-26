import { log } from '#src/server/shared/log.mjs'

export default ({ data, socket }) => {

    const svg = "123"
    socket.handshake.session.captcha = svg
    socket.handshake.session.save()
    socket.emit('captcha', svg)
}
