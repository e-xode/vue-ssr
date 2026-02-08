import { MongoClient } from 'mongodb'
import { logError, logInfo } from './log.js'

let _client = null

const mongoConnect = async() => {
    const {
        MONGO_DB,
        MONGO_HOST,
        MONGO_PWD,
        MONGO_TYPE,
        MONGO_USER
    } = process.env

    const url = `${MONGO_TYPE}://${MONGO_USER}:${MONGO_PWD}@${MONGO_HOST}/${MONGO_DB}`
    _client = new MongoClient(url)

    try {
        await _client.connect()
        logInfo('Database connection successful')
        return { db: _client.db(MONGO_DB), error: null }
    } catch (e) {
        logError(`Database connection error=${e.toString()}`)
        return { db: null, error: e.toString() }
    }
}

const mongoClose = async() => {
    if (_client) {
        await _client.close()
        _client = null
    }
}

export {
    mongoConnect,
    mongoClose
}
