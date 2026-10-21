import { describe, it, expect, vi } from 'vitest';
import { createHealthHandler, createReadiness } from '#src/api/http/readiness.js';

function createResponse() {
  const res = {};
  res.status = vi.fn(() => res);
  res.set = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('api/http/readiness.js', () => {
  it('starts not ready and toggles', () => {
    const readiness = createReadiness();

    expect(readiness.isReady()).toBe(false);
    readiness.setReady();
    expect(readiness.isReady()).toBe(true);
    readiness.setReady(false);
    expect(readiness.isReady()).toBe(false);
  });

  it('answers 503 while starting and 200 once ready', () => {
    const readiness = createReadiness();
    const handler = createHealthHandler(readiness);

    const starting = createResponse();
    handler({}, starting);
    expect(starting.status).toHaveBeenCalledWith(503);
    expect(starting.json).toHaveBeenCalledWith({ status: 'unavailable' });

    readiness.setReady(true);
    const ready = createResponse();
    handler({}, ready);
    expect(ready.status).toHaveBeenCalledWith(200);
    expect(ready.set).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(ready.json).toHaveBeenCalledWith({ status: 'ok' });
  });
});
