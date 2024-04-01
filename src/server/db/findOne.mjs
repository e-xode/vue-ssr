import { ObjectId } from 'mongodb'

const findOne = async ({ collection, db, params } ) => {
    const { slug } = params
    const $match = params._id
        ? { _id: new ObjectId(params._id) }
        : { slug }

    const item = await db.collection(collection).findOne($match)
    return item
}

export default findOne
