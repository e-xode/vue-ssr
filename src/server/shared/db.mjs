import { MongoClient } from 'mongodb'
import { log } from './log.mjs'

const {
    MONGO_DB,
    MONGO_HOST,
    MONGO_PWD,
    MONGO_TYPE,
    MONGO_USER
} = process.env

const url = `${MONGO_TYPE}://${MONGO_USER}:${MONGO_PWD}@${MONGO_HOST}/${MONGO_DB}`

const mongo = (callback) => {
    MongoClient.connect(url, (err, client) => {
        if (err) {
            log(`DB connexion error=${err.toString()}`)
            callback(null, err)
        } else {
            log('DB connexion successful')
            callback(client.db(MONGO_DB), null)
        }
    })
}


export {
    mongo
}
