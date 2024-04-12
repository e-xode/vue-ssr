import { log } from '#src/server/shared/log.mjs'
import { collections } from '#src/shared/model.mjs'
import queries from '#src/server/db/index.mjs'

export default  async ({ data, db, socket  }) => {
    const { user } = socket.handshake.session
    const { field, query, params, type = 'findAll' } = data
    const collection = collections.find(({ name }) => name === data.collection)
    if (!collection) {
        return socket.emit('data.collection', {
            ...data,
            items: [],
            paging: { offset: 0, max: 25, total: 0 },
            status: 404
        })
    }

    if (!collection.public && !user?.isadmin) {
        log(`403: ${user.email} requesting collection: ${collection.name}`)
        return socket.emit('data.collection', {
            ...data,
            items: [],
            paging: { offset: 0, max: 25, total: 0 },
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
