import fs from 'fs'
import { ObjectId } from 'mongodb'
import { convert } from 'url-slug'
import * as R from 'ramda'

import { collections } from '#src/shared/model.mjs'
import { log } from '#src/server/shared/log.mjs'
import { logindb } from '#src/server/shared/logindb.mjs'
import queries from '#src/server/db/index.mjs'

const upload = async ({ form }) => {
    for (let i = 0; i < form.files?.length; i ++) {
        const { file, name, uploaded } = form.files[i]
        if (file && name && !uploaded) {
            const buffer = Buffer.from(file)
            const path = `/uploads/${name}`
            log(`uploading file /app/public${path}`)
            await fs.writeFileSync(`/app/public${path}`, buffer)
            form.files[i].path = path
            form.files[i].uploaded = true
        }
    }
    return form
}
export default async ({ data, db, socket  }) => {
    const { user = {}} = socket.handshake.session
    const { field, query, method, type = 'findOne' } = data
    const isById = ObjectId.isValid(data.form?._id)
    const collection = collections.find(({ name }) => name === data.collection)

    if (!collection) {
        await logindb({
            email: user?.email || socket.handshake.session.id,
            details: 'page.admin.error.collection-item.not-found',
            event: 'user.account',
            user: user?._id,
            status: 404
        }, db)
        return socket.emit('data.collection.item', {
            ...data,
            status: 404
        })
    }

    if ((method || !collection.public) && !user?.isadmin) {
        await logindb({
            email: user?.email || socket.handshake.session.id,
            details: 'page.admin.error.collection-item.not-authorized',
            event: 'user.account',
            user: user._id,
            status: 403
        }, db)
        return socket.emit('data.collection.item', {
            ...data,
            status: 403
        })
    }

    switch(method) {
        case 'CREATE': {
            const uploaded = await upload(data)
            const { name = 'no-name' } = uploaded
            const createditem = await db
                .collection(data.collection)
                .insertOne({
                    ...R.omit(['_id'], uploaded),
                    slug: `${convert(name)}-${Date.now()}`,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                })
            return socket.emit('data.collection.item.created', createditem)
        }
        case 'DELETE': {
            const removed = await db
                .collection(data.collection)
                .deleteOne({ _id: new ObjectId(data.form._id) })
            return socket.emit('data.collection.item.deleted', removed)
        }
        case 'UPDATE': {
            const uploaded = await upload(data)
            await db
                .collection(data.collection)
                .updateOne(
                    { _id: new ObjectId(data.form._id) },
                    { $set: {
                        ...R.omit(['_id'], uploaded),
                        slug: `${convert(uploaded.name)}-${Date.now()}`,
                        updatedAt: Date.now()
                    }}
                )
                const updatequery = isById
                    ? { _id: new ObjectId(data.form._id)}
                    : { ...data.form }
                const item  = await db.collection(data.collection).findOne(updatequery)
                return socket.emit('data.collection.item', {
                    ...data,
                    item
                })
        }
        default: {
            const item = await queries[type]({
                collection: collection.name,
                db,
                field,
                params: { ...data.params },
                query: { ...query }
            })
            socket.emit('data.collection.item', {
                ...data,
                status: item?._id ? 200 : 404,
                item
            })
        }
    }
}
