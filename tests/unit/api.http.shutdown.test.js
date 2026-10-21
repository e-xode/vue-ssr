import { describe, it, expect, vi } from 'vitest';
import { createReadiness } from '#src/api/http/readiness.js';
import { createShutdown } from '#src/api/http/shutdown.js';

function createHttpServer(closeError = null) {
  return { close: vi.fn((callback) => callback(closeError)) };
}

describe('api/http/shutdown.js', () => {
  it('stops accepting traffic, closes the server then the resources, then exits 0', async () => {
    const order = [];
    const readiness = createReadiness();
    readiness.setReady(true);
    const httpServer = { close: vi.fn((cb) => (order.push('server'), cb(null))) };
    const closeResources = vi.fn(async () => order.push('resources'));
    const exit = vi.fn((code) => order.push(`exit:${code}`));

    const shutdown = createShutdown({ httpServer, closeResources, readiness, exit });
    await shutdown();

    expect(readiness.isReady()).toBe(false);
    expect(order).toEqual(['server', 'resources', 'exit:0']);
  });

  it('runs only once when signalled twice', async () => {
    const httpServer = createHttpServer();
    const closeResources = vi.fn(async () => {});
    const exit = vi.fn();

    const shutdown = createShutdown({
      httpServer,
      closeResources,
      readiness: createReadiness(),
      exit,
    });
    await Promise.all([shutdown(), shutdown()]);
    await shutdown();

    expect(httpServer.close).toHaveBeenCalledTimes(1);
    expect(closeResources).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledTimes(1);
  });

  it('exits 1 when closing fails', async () => {
    const httpServer = createHttpServer(new Error('not running'));
    const closeResources = vi.fn(async () => {});
    const exit = vi.fn();

    const shutdown = createShutdown({
      httpServer,
      closeResources,
      readiness: createReadiness(),
      exit,
    });
    await shutdown();

    expect(closeResources).not.toHaveBeenCalled();
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('forces exit 1 after the hard timeout', async () => {
    vi.useFakeTimers();
    const httpServer = { close: vi.fn() };
    const exit = vi.fn();

    const shutdown = createShutdown({
      httpServer,
      closeResources: vi.fn(),
      readiness: createReadiness(),
      exit,
      timeoutMs: 50,
    });
    shutdown();
    await vi.advanceTimersByTimeAsync(60);

    expect(exit).toHaveBeenCalledWith(1);
    vi.useRealTimers();
  });
});
