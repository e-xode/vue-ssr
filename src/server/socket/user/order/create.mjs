import { ObjectId } from 'mongodb'
import { logindb } from '#src/server/shared/logindb.mjs'
import { mail } from '#src/server/shared/email.mjs'
import getOrder from '#src/server/socket/user/order/get.mjs'

export default  async ({ data, db, socket  }) => {

    const { user = {} } = socket.handshake.session
    const item = await db.collection(data.collection).findOne({
        slug: data.slug
    })

    if (!user?._id) {
        await logindb({
            email: socket.handshake.session.email,
            details: 'page.auth.error.user-not-authenticated',
            event: 'user.new.order',
            status: 401
        }, db)
        return socket.emit('user.auth', {
            status: 401,
            error: 'page.auth.error.user-not-authenticated'
        })
    }

    if (!item?._id) {
        await logindb({
            email: user.email,
            details: 'page.item.error.order-item-not-found',
            event: 'user.new.order',
            user: user._id,
            status: 404
        }, db)
        return socket.emit('user.new.order', {
            status: 404,
            error: 'page.item.error.order-item-not-found'
        })
    }

    const check = await db.collection('order').findOne({
        'user._id': new ObjectId(user._id),
        'item._id': new ObjectId(item._id),
        status: 'pending'
    })
    if (check) {
        await logindb({
            email: user.email,
            details: 'page.item.error.order-already-exists',
            event: 'user.new.order',
            user: user._id,
            status: 400
        }, db)
        return socket.emit('user.new.order', {
            status: 400,
            error: 'page.item.error.order-already-exists'
        })
    } else {
        const createdAt = new Date(Date.now())
        await db.collection('order').insertOne({
            amount: item.price,
            collection: data.collection,
            createdAt,
            item,
            status: 'pending',
            shippingfee: user.country.shippingfee,
            updatedAt: createdAt,
            user: {
                ...user,
                _id: new ObjectId(user._id)
            }
        })
        await logindb({
            email: user.email,
            details: 'page.item.error.order.success',
            event: 'user.new.order',
            user: user._id,
            status: 200
        }, db)

        await mail(socket, 'order.html', {
            order: {
                item: {
                    name: item.name,
                    slug: item.slug
                },
                user: {
                    email: user.email
                }
            },
            to: process.env.MAILER_TO,
            subject: 'app.email.order'
        })

        return getOrder({
            data,
            db,
            socket
        })
    }
}
