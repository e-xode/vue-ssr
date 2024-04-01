import { MongoClient } from 'mongodb'
import { log } from './log.mjs'

const {
    MONGO_DB,
    MONGO_HOST,
    MONGO_PWD,
    MONGO_TYPE,
    MONGO_USER
} = process.env

const mongo = async () => {
    const url = `${MONGO_TYPE}://${MONGO_USER}:${MONGO_PWD}@${MONGO_HOST}/${MONGO_DB}`
    const client = new MongoClient(url)
    let error = null

    try {
        await client.connect()
        log('DB connexion successful')
        return { db: client.db(MONGO_DB), error: null }
    } catch (e) {
        error = e.toString()
        log(`DB connexion error=${error}`)
        return { db: null, error }
    }
}

export {
    mongo
}
