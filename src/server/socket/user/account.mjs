import { omit } from 'ramda'
import { hash } from '#src/server/shared/crypt.mjs'
import { logindb } from '#src/server/shared/logindb.mjs'

export default async ({ data, db, socket  }) => {

    let password
    let user

    const {
        country,
        oldpassword,
        newpassword
    } = data

    const {
        email = null,
        status = null
    } = socket.handshake.session.user

    user = await db.collection('user').findOne({ email })

    switch(status) {
        case 449: {
            if (!newpassword?.length) {
                await logindb({
                    email,
                    details: 'page.account.error.missing-fields',
                    event: 'user.account',
                    user: user._id,
                    status: 400
                }, db)
                return socket.emit('user.account', {
                    status: 400,
                    error: 'page.account.error.missing-fields'
                })
            }
            password = hash(newpassword, user.salt)
            break
        }
        default: {
            if (
                (!newpassword?.length && oldpassword?.length) ||
                (newpassword?.length && !oldpassword?.length)
            ) {
                await logindb({
                    email,
                    details: 'page.account.error.missing-fields',
                    event: 'user.account',
                    user: user._id,
                    status: 400
                }, db)
                return socket.emit('user.account', {
                    status: 400,
                    error: 'page.account.error.missing-fields'
                })
            }
            const hashed = oldpassword?.length && newpassword?.length
                ? hash(newpassword, user.salt)
                : user.password
            if (hashed !== user.password) {
                await logindb({
                    email,
                    details: 'page.account.error.password-incorrect',
                    event: 'user.account',
                    user: user._id,
                    status: 400
                }, db)
                return socket.emit('user.account', {
                    status: 400,
                    error: 'page.account.error.password-incorrect'
                })
            }
            password = hashed
            break
        }
    }
    user = await db.collection('user').findOneAndUpdate(
        { email },
        { $set: {
            country,
            password
        }}, {
            returnDocument: 'after'
        }
    )
    await logindb({
        email,
        details: 'page.account.password-update.success',
        event: 'user.account',
        user: user._id,
        status: 200
    }, db)
    socket.handshake.session.user = {
        ...omit(['password', 'salt'], user),
        code: null,
        route: null,
        status: 200
    }
    socket.handshake.session.save()
    socket.emit('user.account', {
        ...socket.handshake.session.user
    })
}
