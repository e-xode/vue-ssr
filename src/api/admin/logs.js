import { ObjectId } from 'mongodb';
import { requireAuth, requireAdmin } from '../middleware.js';
import { parseObjectId, parsePagination } from '#src/shared/dbHelpers.js';
import { LIST_LOGS_DEFAULT_LIMIT } from '#src/shared/const.js';
import { escapeRegex, readString } from '#src/shared/utils.js';

const parseDate = (value) => {
  const text = readString(value);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
};

function buildEventFilter(eventParam) {
  const events = (readString(eventParam) || '').split(',').filter(Boolean);
  if (!events.length) return null;
  return events.length > 1 ? { $in: events } : events[0];
}

function buildDateFilter(from, to) {
  const range = {};
  const start = parseDate(from);
  const end = parseDate(to);
  if (start) range.$gte = start;
  if (end) range.$lte = end;
  return Object.keys(range).length ? range : null;
}

function buildSearchFilter(searchParam) {
  const search = readString(searchParam);
  if (!search) return null;
  const pattern = { $regex: escapeRegex(search), $options: 'i' };
  return [{ event: pattern }, { ip: pattern }, { 'meta.email': pattern }];
}

function buildLogsFilter(query) {
  const filter = {};

  const event = buildEventFilter(query.event);
  if (event) filter.event = event;

  const userId = parseObjectId(readString(query.userId));
  if (userId) filter.userId = userId;

  const createdAt = buildDateFilter(query.from, query.to);
  if (createdAt) filter.createdAt = createdAt;

  const search = buildSearchFilter(query.search);
  if (search) filter.$or = search;

  return filter;
}

async function enrichLogsWithUsers(db, logs) {
  const userIds = [...new Set(logs.filter((l) => l.userId).map((l) => l.userId.toString()))].map(
    (id) => new ObjectId(id)
  );

  let usersMap = {};
  if (userIds.length) {
    const users = await db
      .collection('users')
      .find({ _id: { $in: userIds } }, { projection: { name: 1, email: 1 } })
      .toArray();
    usersMap = Object.fromEntries(
      users.map((u) => [u._id.toString(), { name: u.name, email: u.email }])
    );
  }

  return logs.map((log) => ({
    ...log,
    user: log.userId ? usersMap[log.userId.toString()] || null : null,
  }));
}

async function handleListLogs(req, res, db) {
  try {
    const { page, limit, skip } = parsePagination(
      { page: req.query.page, limit: req.query.perPage },
      { defaultLimit: LIST_LOGS_DEFAULT_LIMIT }
    );
    const filter = buildLogsFilter(req.query);

    const [logs, total] = await Promise.all([
      db.collection('logs').find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      db.collection('logs').countDocuments(filter),
    ]);

    const enriched = await enrichLogsWithUsers(db, logs);

    res.json({ logs: enriched, total, page, perPage: limit });
  } catch (err) {
    console.error('Admin logs list error:', err);
    res.status(500).json({ error: 'error.server' });
  }
}

async function handleListLogEvents(req, res, db) {
  try {
    const events = await db.collection('logs').distinct('event');
    res.json(events.sort());
  } catch (err) {
    console.error('Admin logs events error:', err);
    res.status(500).json({ error: 'error.server' });
  }
}

async function handleDeleteLog(req, res, db) {
  const logId = parseObjectId(req.params.id);
  if (!logId) return res.status(400).json({ error: 'error.invalidId' });
  try {
    await db.collection('logs').deleteOne({ _id: logId });
    res.json({ success: true });
  } catch (err) {
    console.error('Admin log delete error:', err);
    res.status(500).json({ error: 'error.server' });
  }
}

async function handleBulkDeleteLogs(req, res, db) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ error: 'error.validation' });
    }
    const objectIds = ids.map((id) => parseObjectId(readString(id))).filter(Boolean);
    await db.collection('logs').deleteMany({ _id: { $in: objectIds } });
    res.json({ success: true });
  } catch (err) {
    console.error('Admin logs bulk delete error:', err);
    res.status(500).json({ error: 'error.server' });
  }
}

export function setupAdminLogsRoute(app, db) {
  app.get('/api/admin/logs', requireAuth, requireAdmin(db), (req, res) =>
    handleListLogs(req, res, db)
  );

  app.get('/api/admin/logs/events', requireAuth, requireAdmin(db), (req, res) =>
    handleListLogEvents(req, res, db)
  );

  app.delete('/api/admin/logs/:id', requireAuth, requireAdmin(db), (req, res) =>
    handleDeleteLog(req, res, db)
  );

  app.delete('/api/admin/logs', requireAuth, requireAdmin(db), (req, res) =>
    handleBulkDeleteLogs(req, res, db)
  );
}
