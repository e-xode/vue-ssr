import { describe, it, expect, vi } from 'vitest';
import { logEvent } from '#src/shared/logger';

describe('shared/logger.js logEvent', () => {
  it('returns the insert promise so callers can await it', async () => {
    const insertOne = vi.fn().mockResolvedValue({ acknowledged: true });
    const db = { collection: () => ({ insertOne }) };

    await logEvent(db, { event: 'test-event', userId: 'u1', ip: '203.0.113.7', meta: { a: 1 } });

    expect(insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'test-event',
        userId: 'u1',
        ip: '203.0.113.7',
        meta: { a: 1 },
      })
    );
  });

  it('swallows and logs an insert failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const db = { collection: () => ({ insertOne: vi.fn().mockRejectedValue(new Error('down')) }) };

    await expect(logEvent(db, { event: 'test-event' })).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
  });
});
