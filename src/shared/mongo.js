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

    const url = MONGO_USER
      ? `${MONGO_TYPE}://${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PWD)}@${MONGO_HOST}/${MONGO_DB}`
      : `${MONGO_TYPE}://${MONGO_HOST}/${MONGO_DB}`

    _client = new MongoClient(url, {
        maxPoolSize: 50,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
    })

    try {
        await _client.connect()
        const db = _client.db(MONGO_DB)
        logInfo('Database connection successful')
        return { client: _client, db, error: null }
    } catch (e) {
        logError(`Database connection error=${e.toString()}`)
        return { client: null, db: null, error: e.toString() }
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
