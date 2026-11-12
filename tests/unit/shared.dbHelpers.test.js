import { describe, it, expect, vi } from 'vitest';
import { ADMIN_PROMOTION, isDuplicateKeyError, promoteToAdmin } from '#src/shared/dbHelpers.js';
import { USER_TYPES } from '#src/shared/const.js';
import { createCollection, createDb } from '../fixtures/routeHarness.js';

const USER_ID = '65f1c2a4b3d4e5f6a7b8c9d0';

function buildDb(user) {
  const users = createCollection({
    findOne: vi.fn().mockResolvedValue(user),
    updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
  });
  return { db: createDb({ users }), users };
}

describe('shared/dbHelpers.js promoteToAdmin', () => {
  it('rejects a missing or non-string email without querying', async () => {
    const { db, users } = buildDb(null);

    expect(await promoteToAdmin(db, undefined)).toBe(ADMIN_PROMOTION.INVALID_EMAIL);
    expect(await promoteToAdmin(db, '   ')).toBe(ADMIN_PROMOTION.INVALID_EMAIL);
    expect(await promoteToAdmin(db, { $ne: null })).toBe(ADMIN_PROMOTION.INVALID_EMAIL);
    expect(users.findOne).not.toHaveBeenCalled();
  });

  it('reports an unknown account', async () => {
    const { db, users } = buildDb(null);

    expect(await promoteToAdmin(db, 'nobody@example.com')).toBe(ADMIN_PROMOTION.NOT_FOUND);
    expect(users.updateOne).not.toHaveBeenCalled();
  });

  it('leaves an existing admin untouched', async () => {
    const { db, users } = buildDb({ _id: USER_ID, type: USER_TYPES.ADMIN });

    expect(await promoteToAdmin(db, 'admin@example.com')).toBe(ADMIN_PROMOTION.ALREADY_ADMIN);
    expect(users.updateOne).not.toHaveBeenCalled();
  });

  it('promotes a user, looking the email up in its normalized form', async () => {
    const { db, users } = buildDb({ _id: USER_ID, type: USER_TYPES.USER });

    expect(await promoteToAdmin(db, '  User@Example.com ')).toBe(ADMIN_PROMOTION.PROMOTED);

    expect(users.findOne.mock.calls[0][0]).toEqual({ email: 'user@example.com' });
    const [filter, update] = users.updateOne.mock.calls[0];
    expect(filter).toEqual({ _id: USER_ID });
    expect(update.$set.type).toBe(USER_TYPES.ADMIN);
  });
});

describe('shared/dbHelpers.js isDuplicateKeyError', () => {
  it('recognises the MongoDB duplicate key code only', () => {
    expect(isDuplicateKeyError({ code: 11000 })).toBe(true);
    expect(isDuplicateKeyError({ code: 85 })).toBe(false);
    expect(isDuplicateKeyError(new Error('boom'))).toBe(false);
    expect(isDuplicateKeyError(null)).toBe(false);
  });
});
