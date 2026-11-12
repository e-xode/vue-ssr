import {
  API_ERROR_KEYS,
  API_PATH_PREFIX,
  DEFAULT_CLIENT_ERROR_KEY,
  DEFAULT_SERVER_ERROR_KEY,
} from '#src/api/http/constants.js';

const SERVER_ERROR_STATUS = 500;

function readStatus(err) {
  const status = err?.status ?? err?.statusCode;
  return Number.isInteger(status) && status >= 400 && status < 600 ? status : SERVER_ERROR_STATUS;
}

function errorKeyFor(status) {
  if (API_ERROR_KEYS[status]) return API_ERROR_KEYS[status];
  return status >= SERVER_ERROR_STATUS ? DEFAULT_SERVER_ERROR_KEY : DEFAULT_CLIENT_ERROR_KEY;
}

export function createForbiddenOriginError() {
  return Object.assign(new Error('CORS origin not allowed'), { status: 403 });
}

export function ensureRequestBody(req, res, next) {
  req.body = req.body ?? {};
  next();
}

export function apiNotFoundHandler(req, res) {
  res.status(404).json({ error: API_ERROR_KEYS[404] });
}

export function apiErrorHandler(err, req, res, next) {
  if (res.headersSent || !req.originalUrl.startsWith(API_PATH_PREFIX)) return next(err);

  const status = readStatus(err);
  if (status >= SERVER_ERROR_STATUS) console.error(err);
  res.status(status).json({ error: errorKeyFor(status) });
}
