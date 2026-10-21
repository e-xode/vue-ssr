import { NO_STORE_CACHE_CONTROL } from '#src/api/http/constants.js';

export function createReadiness() {
  let ready = false;

  return {
    isReady: () => ready,
    setReady: (value = true) => {
      ready = Boolean(value);
    },
  };
}

export function createHealthHandler(readiness) {
  return (req, res) => {
    const ready = readiness.isReady();
    res
      .status(ready ? 200 : 503)
      .set('Cache-Control', NO_STORE_CACHE_CONTROL)
      .json({ status: ready ? 'ok' : 'unavailable' });
  };
}
