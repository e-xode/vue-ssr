import { ObjectId } from 'mongodb';
import { USER_SAFE_PROJECTION, USER_TYPES } from '#src/shared/const.js';
import { readEmail } from '#src/shared/utils.js';

export function parseObjectId(str) {
  if (!str || !ObjectId.isValid(str)) return null;
  return new ObjectId(str);
}

const DUPLICATE_KEY_ERROR_CODE = 11000;

export function isDuplicateKeyError(err) {
  return err?.code === DUPLICATE_KEY_ERROR_CODE;
}

export function parsePagination(query, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export async function findUserSafe(db, filter) {
  return db.collection('users').findOne(filter, { projection: USER_SAFE_PROJECTION });
}

export const ADMIN_PROMOTION = {
  INVALID_EMAIL: 'invalid_email',
  NOT_FOUND: 'not_found',
  ALREADY_ADMIN: 'already_admin',
  PROMOTED: 'promoted',
};

export async function promoteToAdmin(db, rawEmail) {
  const email = readEmail(rawEmail);
  if (!email) return ADMIN_PROMOTION.INVALID_EMAIL;

  const users = db.collection('users');
  const user = await users.findOne({ email }, { projection: { type: 1 } });
  if (!user) return ADMIN_PROMOTION.NOT_FOUND;
  if (user.type === USER_TYPES.ADMIN) return ADMIN_PROMOTION.ALREADY_ADMIN;

  const promotion = { $set: { type: USER_TYPES.ADMIN, updatedAt: new Date() } };
  await users.updateOne({ _id: user._id }, promotion);
  return ADMIN_PROMOTION.PROMOTED;
}
