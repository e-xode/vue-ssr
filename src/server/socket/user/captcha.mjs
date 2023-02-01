import TextToSVG from 'text-to-svg-path'
import { log } from '#src/server/shared/log.mjs'

export default ({ data, socket }) => {
    const textToSVG = TextToSVG.loadSync()
    const captcha = (Math.floor(100000 + Math.random() * 900000))
    const svg = textToSVG.getSVG(`${captcha}`, {
        anchor: 'top',
        attributes: { fill: 'black', stroke: 'black' },
        fontSize: 32,
        x: 0,
        y: 0
    })
    socket.handshake.session.captcha = `${captcha}`
    socket.handshake.session.save()
    socket.emit('captcha', svg)
}
