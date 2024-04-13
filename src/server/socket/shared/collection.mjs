import { collections } from '#src/shared/model.mjs'
import { logindb } from '#src/server/shared/logindb.mjs'
import queries from '#src/server/db/index.mjs'

export default  async ({ data, db, socket  }) => {
    const { user = {} } = socket.handshake.session
    const { field, query, params, type = 'findAll' } = data
    const collection = collections.find(({ name }) => name === data.collection)
    if (!collection) {
        await logindb({
            email: user?.email || socket.handshake.session.id,
            details: 'page.admin.error.collection.not-found',
            event: 'user.account',
            user: user?._id,
            status: 404
        }, db)
        return socket.emit('data.collection', {
            ...data,
            status: 404
        })
    }

    if (!collection.public && !user?.isadmin) {
        await logindb({
            email: user?.email || socket.handshake.session.id,
            details: 'page.admin.error.collection.not-authorized',
            event: 'user.account',
            user: user?._id,
            status: 403
        }, db)
        return socket.emit('data.collection', {
            ...data,
            status: 403
        })
    }

    const { items, total } = await queries[type]({
        collection: collection.name,
        db,
        field,
        params: { ...params },
        query: { ...query }
    })
    socket.emit('data.collection', {
        ...data,
        items,
        paging: { offset: 0, max: 25, total },
        status: 200
    })
}
