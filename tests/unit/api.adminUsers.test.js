import { describe, it, expect, vi } from 'vitest';
import { ObjectId } from 'mongodb';
import { ADMIN_USER_PROJECTION, USER_TYPES } from '#src/shared/const.js';
import { destroyUserSessions } from '#src/shared/security.js';
import { removeAvatarFile } from '#src/api/auth/avatar.js';
import { setupAdminUsersRoutes } from '#src/api/admin/users.js';
import {
  callRoute,
  createCollection,
  createDb,
  createReq,
  createRouteApp,
} from '../fixtures/routeHarness.js';

vi.mock('#src/shared/security.js', async (importOriginal) => ({
  ...(await importOriginal()),
  destroyUserSessions: vi.fn(),
}));

vi.mock('#src/api/auth/avatar.js', () => ({ removeAvatarFile: vi.fn() }));

const ADMIN_ID = new ObjectId('65f1c2a4b3d4e5f6a7b8c9d0');
const TARGET_ID = new ObjectId('65f1c2a4b3d4e5f6a7b8c9d1');
const USER_ROUTE = '/api/admin/users/:userId';

function mount(target) {
  const users = createCollection({
    findOne: vi.fn().mockResolvedValue(target),
    findOneAndUpdate: vi.fn().mockResolvedValue(target),
    updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
  });
  const blockedIps = createCollection({
    updateOne: vi.fn().mockResolvedValue({}),
    deleteMany: vi.fn().mockResolvedValue({}),
  });
  const logs = createCollection({
    insertOne: vi.fn().mockResolvedValue({}),
    deleteMany: vi.fn().mockResolvedValue({}),
  });
  const { app, routes } = createRouteApp();
  setupAdminUsersRoutes(app, createDb({ users, blockedIps, logs }));
  return { routes, users, blockedIps, logs };
}

function adminReq(targetId, body = {}) {
  return createReq({ params: { userId: targetId.toString() }, body, userId: ADMIN_ID });
}

describe('api/admin/users update', () => {
  it('refuses an admin removing their own admin role', async () => {
    const { routes, users } = mount({ _id: ADMIN_ID, type: USER_TYPES.ADMIN });

    const res = await callRoute(
      routes,
      `PUT ${USER_ROUTE}`,
      adminReq(ADMIN_ID, { type: USER_TYPES.USER })
    );

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'error.admin.cannotDemoteSelf' });
    expect(users.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('updates another user with a trimmed name and the admin projection', async () => {
    const { routes, users } = mount({ _id: TARGET_ID, type: USER_TYPES.USER });

    const res = await callRoute(
      routes,
      `PUT ${USER_ROUTE}`,
      adminReq(TARGET_ID, { name: '  Ada  ', type: USER_TYPES.ADMIN })
    );

    expect(res.statusCode).toBe(200);
    const [, update, options] = users.findOneAndUpdate.mock.calls[0];
    expect(update.$set.name).toBe('Ada');
    expect(update.$set.type).toBe(USER_TYPES.ADMIN);
    expect(options.projection).toEqual(ADMIN_USER_PROJECTION);
  });
});

describe('api/admin/users block', () => {
  it('refuses to block an admin account', async () => {
    const { routes, users } = mount({ _id: TARGET_ID, type: USER_TYPES.ADMIN });

    const res = await callRoute(routes, `PUT ${USER_ROUTE}/block`, adminReq(TARGET_ID));

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'error.admin.cannotModifyAdmin' });
    expect(users.updateOne).not.toHaveBeenCalled();
    expect(destroyUserSessions).not.toHaveBeenCalled();
  });

  it('answers 404 for an unknown user', async () => {
    const { routes } = mount(null);

    const res = await callRoute(routes, `PUT ${USER_ROUTE}/block`, adminReq(TARGET_ID));

    expect(res.statusCode).toBe(404);
  });

  it('blocks only the most recent login IP', async () => {
    const loginHistory = [{ ip: '198.51.100.9' }];
    const target = { _id: TARGET_ID, type: USER_TYPES.USER, loginHistory };
    const { routes, users, blockedIps } = mount(target);

    const res = await callRoute(
      routes,
      `PUT ${USER_ROUTE}/block`,
      adminReq(TARGET_ID, { blockIps: true })
    );

    expect(res.body).toEqual({ success: true });
    expect(users.findOne.mock.calls[0][1].projection.loginHistory).toEqual({ $slice: -1 });
    expect(blockedIps.updateOne).toHaveBeenCalledTimes(1);
    expect(blockedIps.updateOne.mock.calls[0][0]).toEqual({ ip: '198.51.100.9' });
    expect(blockedIps.updateOne.mock.calls[0][1].$set.reason).toBe(`user:${TARGET_ID}`);
    expect(destroyUserSessions).toHaveBeenCalled();
  });

  it('blocks no IP for a user who never signed in', async () => {
    const { routes, blockedIps } = mount({ _id: TARGET_ID, type: USER_TYPES.USER });

    await callRoute(routes, `PUT ${USER_ROUTE}/block`, adminReq(TARGET_ID, { blockIps: true }));

    expect(blockedIps.updateOne).not.toHaveBeenCalled();
  });
});

describe('api/admin/users delete', () => {
  it('refuses to delete an admin account', async () => {
    const { routes, users } = mount({ _id: TARGET_ID, type: USER_TYPES.ADMIN });

    const res = await callRoute(routes, `DELETE ${USER_ROUTE}`, adminReq(TARGET_ID));

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'error.admin.cannotModifyAdmin' });
    expect(users.deleteOne).not.toHaveBeenCalled();
  });

  it('refuses an admin deleting their own account', async () => {
    const { routes, users } = mount({ _id: ADMIN_ID, type: USER_TYPES.ADMIN });

    const res = await callRoute(routes, `DELETE ${USER_ROUTE}`, adminReq(ADMIN_ID));

    expect(res.body).toEqual({ error: 'error.admin.cannotDeleteSelf' });
    expect(users.deleteOne).not.toHaveBeenCalled();
  });

  it('removes the user with their sessions, IP blocks, logs and avatar file', async () => {
    const target = { _id: TARGET_ID, type: USER_TYPES.USER, avatar: '/uploads/avatars/a.png' };
    const { routes, users, blockedIps, logs } = mount(target);

    const res = await callRoute(routes, `DELETE ${USER_ROUTE}`, adminReq(TARGET_ID));

    expect(res.body).toEqual({ status: 'success' });
    expect(destroyUserSessions).toHaveBeenCalled();
    expect(users.deleteOne).toHaveBeenCalledWith({ _id: TARGET_ID });
    expect(blockedIps.deleteMany).toHaveBeenCalledWith({ reason: `user:${TARGET_ID}` });
    expect(logs.deleteMany).toHaveBeenCalledWith({ userId: TARGET_ID });
    expect(removeAvatarFile).toHaveBeenCalledWith('/uploads/avatars/a.png');
  });
});
