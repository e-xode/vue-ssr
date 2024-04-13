import { ObjectId } from 'mongodb'

const findOne = async ({ collection, db, params } ) => {
    const { slug } = params
    if (slug || ObjectId.isValid(params._id)) {
        const $match = slug
            ? { slug }
            : { _id: new ObjectId(params._id) }
        return await db.collection(collection).findOne($match)
    }
    return null
}

export default findOne
