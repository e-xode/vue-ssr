import { ObjectId } from 'mongodb'
import { logindb } from '#src/server/shared/logindb.mjs'

export default async ({ data, db, socket  }) => {
    const { user = {} } = socket.handshake.session

    if (!user?._id) {
        await logindb({
            email: user.email,
            details: 'page.auth.error.user-not-authenticated',
            event: 'user.get.orders',
            user: user._id,
            status: 401
        }, db)
        return socket.emit('user.auth', {
            status: 401,
            error: 'page.auth.error.user-not-authenticated'
        })
    }

    const orders = await db.collection('order').find({
        'user._id': new ObjectId(user._id),
        'item.slug': data.slug
    }).toArray()

    if (orders.length) {
        return socket.emit('user.get.orders', {
            status: 200,
            orders
        })
    }

    return socket.emit('user.get.orders', {
        status: 404
    })
}
