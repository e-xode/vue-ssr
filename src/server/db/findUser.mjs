import { ObjectId } from 'mongodb'
import { omit } from 'ramda'

const findUser = async ({ db, _id }) => {

    const results = await db.collection('user').aggregate([
        { $match: {
            _id: new ObjectId(_id)
        }},
        { $addFields: { countryId: { $toObjectId: '$country._id' } }},
        { $lookup: {
            from: 'country',
            localField: 'countryId',
            foreignField: '_id',
            as: 'countries'
        }}
    ]).toArray()

    const user = results.shift()

    if (user?._id) {
        return {
            ...omit(['countryId', 'password', 'salt'], user),
            country: user.countries.shift(),
            orders: []
        }
    }
    return null
}

export default findUser
