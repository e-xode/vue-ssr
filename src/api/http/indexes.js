import { LOG_RETENTION_DAYS } from '#src/shared/const.js';
import { logWarn } from '#src/shared/log.js';

const SECONDS_PER_DAY = 24 * 60 * 60;
const INDEX_OPTIONS_CONFLICT_CODE = 85;
const LOGS_CREATED_AT_KEY = { createdAt: -1 };

const INDEXES = [
  { collection: 'users', key: { email: 1 }, options: { unique: true } },
  { collection: 'blockedIps', key: { ip: 1 }, options: { unique: true } },
  { collection: 'logs', key: { event: 1 }, options: {} },
  { collection: 'logs', key: { userId: 1 }, options: {} },
];

async function ensureLogsRetention(db) {
  const options = { expireAfterSeconds: LOG_RETENTION_DAYS * SECONDS_PER_DAY };
  try {
    await db.collection('logs').createIndex(LOGS_CREATED_AT_KEY, options);
  } catch (err) {
    if (err?.code !== INDEX_OPTIONS_CONFLICT_CODE) throw err;
    await db.command({ collMod: 'logs', index: { keyPattern: LOGS_CREATED_AT_KEY, ...options } });
  }
}

async function ensureSafely(description, ensure) {
  try {
    await ensure();
  } catch (err) {
    logWarn(`Index not ensured (${description}): ${err?.message ?? err}`);
  }
}

export async function ensureIndexes(db) {
  for (const { collection, key, options } of INDEXES) {
    const description = `${collection} ${JSON.stringify(key)}`;
    await ensureSafely(description, () => db.collection(collection).createIndex(key, options));
  }
  await ensureSafely('logs retention', () => ensureLogsRetention(db));
}
