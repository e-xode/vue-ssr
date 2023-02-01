import { log } from '#src/server/shared/log.mjs'
import { hash } from '#src/server/shared/crypt.mjs'

export default async ({ data, db, socket  }) => {
    const { oldpassword, newpassword } = data
    if (!oldpassword || !newpassword) {
        return socket.emit('account', {
            status: 400,
            error: 'page.account.error.missing-fields'
        })
    }

    const { email } = socket.handshake.session.user
    const user = await db.collection('user').findOne({ email })
    const hashed = hash(oldpassword, user.salt)
    if (hashed !== user.password) {
        return socket.emit('account', {
            status: 400,
            error: 'page.account.error.password-incorrect'
        })
    }

    const newhashed = hash(newpassword, user.salt)
    await db.collection('user').updateOne(
        { email },
        { $set: { password: newhashed }}
    )

    socket.handshake.session.save()
    return socket.emit('account', {
        ...socket.handshake.session.user,
        status: 200,
    })
}
