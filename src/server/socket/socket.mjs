import account from '#src/server/socket/user/account.mjs'
import auth from '#src/server/socket/user/auth.mjs'
import captcha from '#src/server/socket/user/captcha.mjs'
import login from '#src/server/socket/user/login.mjs'
import logout from '#src/server/socket/user/logout.mjs'
import getOrders from '#src/server/socket/user/order/get.mjs'
import newOrder from '#src/server/socket/user/order/create.mjs'
import register from '#src/server/socket/user/register.mjs'
import resetPassword from '#src/server/socket/user/reset.mjs'

import collection from '#src/server/socket/shared/collection.mjs'
import collectionItem from '#src/server/socket/shared/collection.item.mjs'

const socket = ({ io, db }) => {
    io.on('disconnect', (socket) => {
        socket.removeAllListeners()
    })

    io.on('connection', (socket) => {
        socket.removeAllListeners()
        socket.handshake.session.updatedAt = new Date()
        socket.handshake.session.save()
        socket.onAny((message, data) => {
            switch(message) {
                case 'data.collection':
                    return collection({ data, db, socket })
                case 'data.collection.item':
                    return collectionItem({ data, db, socket })
                case 'user.account':
                    return account({ data, db, socket })
                case 'user.auth':
                    return auth({ data, db, socket })
                case 'user.captcha':
                    return captcha({ data, db, socket })
                case 'user.login':
                    return login({ data, db, socket })
                case 'user.logout':
                    return logout({ data, db, socket })
                case 'user.get.orders':
                    return getOrders({ data, db, socket })
                case 'user.new.order':
                    return newOrder({ data, db, socket })
                case 'user.register':
                    return register({ data, db, socket })
                case 'user.reset-password':
                    return resetPassword({ data, db, socket })
                default:
                    return socket.emit(404)
            }
        })
    })
}
export {
    socket
}
