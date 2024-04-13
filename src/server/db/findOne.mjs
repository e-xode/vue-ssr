import { ObjectId } from 'mongodb'

const findOne = async ({ collection, db, params } ) => {
    if (ObjectId.isValid(params._id)) {
        const { slug } = params
        const $match = params._id
            ? { _id: new ObjectId(params._id) }
            : { slug }
        return await db.collection(collection).findOne($match)
    }
    return null
}

export default findOne
