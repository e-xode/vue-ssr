const findDistincts = async ({ collection, field, db, params, query } ) => {

    const { offset = 0, max = 25 } = query

    const results = await db
        .collection(collection)
        .aggregate([
            { $project: {
                [field]: {
                    $trim: { input: { $toLower: `$${field}` } }
                }
            }},
            { $group: {
                _id: `$${field}`,
                count: { $sum: 1 }
            }},
            { $sort: {
                count: 1
            }},
            { $facet: {
                meta: [{ $count: 'total' }],
                data: [
                    { $skip: offset },
                    { $limit: max }
                ]
            }}
        ]).toArray()

    const { meta = [], data = [] } = results.shift()
    return {
        total: meta[0]?.total,
        items: data
    }
}

export default findDistincts
