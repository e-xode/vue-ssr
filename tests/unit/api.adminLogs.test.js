import { describe, it, expect, vi } from 'vitest';
import { setupAdminLogsRoute } from '#src/api/admin/logs.js';
import {
  callRoute,
  createCollection,
  createDb,
  createReq,
  createRouteApp,
} from '../fixtures/routeHarness.js';

function buildLogsDb() {
  const cursor = {};
  cursor.sort = vi.fn(() => cursor);
  cursor.skip = vi.fn(() => cursor);
  cursor.limit = vi.fn(() => cursor);
  cursor.toArray = vi.fn().mockResolvedValue([]);
  const logs = createCollection({
    find: vi.fn(() => cursor),
    countDocuments: vi.fn().mockResolvedValue(0),
  });
  return { db: createDb({ logs, users: createCollection() }), logs, cursor };
}

async function listLogs(query) {
  const { db, logs, cursor } = buildLogsDb();
  const { app, routes } = createRouteApp();
  setupAdminLogsRoute(app, db);
  const res = await callRoute(routes, 'GET /api/admin/logs', createReq({ query }));
  return { res, logs, cursor };
}

describe('api/admin/logs.js', () => {
  it('caps the page size and never lets NaN reach skip or limit', async () => {
    const { res, cursor } = await listLogs({ page: 'abc', perPage: 'xyz' });

    expect(res.body.perPage).toBe(50);
    expect(cursor.skip).toHaveBeenCalledWith(0);
    expect(cursor.limit).toHaveBeenCalledWith(50);
  });

  it('caps an oversized perPage at the maximum', async () => {
    const { res, cursor } = await listLogs({ page: '2', perPage: '100000' });

    expect(res.body.perPage).toBe(100);
    expect(cursor.skip).toHaveBeenCalledWith(100);
  });

  it('turns a comma separated event list into an $in filter', async () => {
    const { logs } = await listLogs({ event: 'user-signin,user-signup' });

    expect(logs.find).toHaveBeenCalledWith({ event: { $in: ['user-signin', 'user-signup'] } });
  });

  it('keeps a single event as a plain equality', async () => {
    const { logs } = await listLogs({ event: 'user-signin' });

    expect(logs.find).toHaveBeenCalledWith({ event: 'user-signin' });
  });

  it('escapes regex metacharacters in the search term', async () => {
    const { logs } = await listLogs({ search: '.*(a+)+$' });

    const [filter] = logs.find.mock.calls[0];
    expect(filter.$or[0].event.$regex).toBe('\\.\\*\\(a\\+\\)\\+\\$');
  });

  it('ignores operator objects passed as query values', async () => {
    const { logs } = await listLogs({ event: { $ne: null }, search: { $regex: '.*' } });

    expect(logs.find).toHaveBeenCalledWith({});
  });

  it('ignores invalid dates', async () => {
    const { logs } = await listLogs({ from: 'not-a-date' });

    expect(logs.find).toHaveBeenCalledWith({});
  });
});
