import { ObjectId } from 'mongodb'
import { USER_SAFE_PROJECTION } from '#src/shared/const.js'

export function parseObjectId(str) {
  if (!str || !ObjectId.isValid(str)) return null
  return new ObjectId(str)
}

export function parsePagination(query, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit) || defaultLimit))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export async function findUserSafe(db, filter) {
  return db.collection('users').findOne(filter, { projection: USER_SAFE_PROJECTION })
}

export async function getUserWithCounts(db, userId) {
  const oid = typeof userId === 'string' ? new ObjectId(userId) : userId
  const user = await findUserSafe(db, { _id: oid })
  return user
}
