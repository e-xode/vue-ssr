const logindb =  async (data, db) => {
    await db.collection('log').insertOne({
        ...data,
        createAt: new Date(Date.now())
    })
}
export {
    logindb
}
