import TextToSVG from 'text-to-svg-path'
import { rand } from '#src/server/shared/crypt.mjs'

export default ({ socket }) => {
    const textToSVG = TextToSVG.loadSync()
    const captcha = rand()
    const svg = textToSVG.getSVG(`${captcha}`, {
        anchor: 'top',
        attributes: { fill: 'black', stroke: 'black' },
        fontSize: 32,
        x: 0,
        y: 0
    })
    socket.handshake.session.captcha = `${captcha}`
    socket.handshake.session.save()
    socket.emit('user.captcha', svg)
}
