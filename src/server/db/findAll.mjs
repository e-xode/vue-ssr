const findAll = async ({ collection, db, params, query } ) => {
    const { field, enabled, keyword, quantity, sort } = params
    const { category, offset = 0, max = 25 } = query
    const $match = {}
    const $addFields = {}
    const $sort = sort
        ? sort
        : { _id: -1 }

    if (typeof enabled !== 'undefined') {
        $match.enabled = enabled
    }

    if (category) {
        $addFields.category = { $trim: { input: { $toLower: '$category.name' } } }
        $match.category = { $regex: new RegExp(`^${category.toLowerCase()}$`, 'i') }
    }

    if (quantity) {
        $addFields.quantity = { $toInt: "$quantity" }
        $match.quantity = quantity
    }

    if (keyword) {
        $match[field] = { $regex: keyword.toString(), $options: 'i' }
    }

    const results = await db
        .collection(collection)
        .aggregate([
            { $addFields },
            { $match },
            { $sort },
            { $facet: {
                meta: [{ $count: 'total' }],
                data: [
                    { $skip: Math.abs(offset) },
                    { $limit: Math.abs(max) }
                ]
            }}
        ]).toArray()

    const { meta = [], data = [] } = results.shift()
    return {
        total: meta[0]?.total,
        items: data
    }
}

export default findAll
