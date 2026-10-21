import { logInfo } from '#src/shared/log.js';
import { SHUTDOWN_TIMEOUT_MS } from '#src/api/http/constants.js';

function closeServer(httpServer) {
  return new Promise((resolve, reject) => {
    httpServer.close((err) => (err ? reject(err) : resolve()));
  });
}

export function createShutdown({
  httpServer,
  closeResources,
  readiness,
  exit = process.exit,
  timeoutMs = SHUTDOWN_TIMEOUT_MS,
}) {
  let started = false;

  return async function shutdown() {
    if (started) return;
    started = true;
    readiness.setReady(false);
    logInfo('Shutting down...');
    setTimeout(() => exit(1), timeoutMs).unref();
    try {
      await closeServer(httpServer);
      await closeResources();
      exit(0);
    } catch (err) {
      console.error(err);
      exit(1);
    }
  };
}
