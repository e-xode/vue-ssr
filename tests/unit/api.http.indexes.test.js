import { describe, it, expect, vi } from 'vitest';
import { ensureIndexes } from '#src/api/http/indexes.js';
import { LOG_RETENTION_DAYS } from '#src/shared/const.js';

const RETENTION_SECONDS = LOG_RETENTION_DAYS * 24 * 60 * 60;

function buildDb(createIndex) {
  const command = vi.fn().mockResolvedValue({ ok: 1 });
  const collection = (name) => ({ createIndex: (...args) => createIndex(name, ...args) });
  return { db: { collection, command }, command };
}

function warnings() {
  return vi.mocked(console.warn).mock.calls.map(([line]) => line);
}

describe('api/http/indexes.js', () => {
  it('creates the unique indexes and the log retention index', async () => {
    const createIndex = vi.fn().mockResolvedValue('ok');
    const { db, command } = buildDb(createIndex);

    await ensureIndexes(db);

    expect(createIndex).toHaveBeenCalledWith('users', { email: 1 }, { unique: true });
    expect(createIndex).toHaveBeenCalledWith('blockedIps', { ip: 1 }, { unique: true });
    expect(createIndex).toHaveBeenCalledWith(
      'logs',
      { createdAt: -1 },
      { expireAfterSeconds: RETENTION_SECONDS }
    );
    expect(command).not.toHaveBeenCalled();
  });

  it('converts an existing plain createdAt index into the retention index', async () => {
    const conflict = Object.assign(new Error('IndexOptionsConflict'), { code: 85 });
    const createIndex = vi.fn(async (name, key) => {
      if (name === 'logs' && key.createdAt) throw conflict;
      return 'ok';
    });
    const { db, command } = buildDb(createIndex);

    await ensureIndexes(db);

    expect(command).toHaveBeenCalledWith({
      collMod: 'logs',
      index: { keyPattern: { createdAt: -1 }, expireAfterSeconds: RETENTION_SECONDS },
    });
    expect(warnings()).toEqual([]);
  });

  it('warns and carries on when an index cannot be created', async () => {
    const createIndex = vi.fn(async (name) => {
      if (name === 'users') throw new Error('duplicate emails');
      return 'ok';
    });
    const { db } = buildDb(createIndex);

    await expect(ensureIndexes(db)).resolves.toBeUndefined();

    expect(warnings().some((line) => line.includes('duplicate emails'))).toBe(true);
    expect(createIndex).toHaveBeenCalledWith('blockedIps', { ip: 1 }, { unique: true });
  });
});
