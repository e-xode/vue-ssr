import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { buildCsp } from '#src/api/http/csp.js';
import {
  RATE_LIMIT_WINDOW_MS,
  API_RATE_LIMIT_MAX,
  GLOBAL_RATE_LIMIT_MAX,
} from '#src/api/http/constants.js';

export function createHelmet(isProduction) {
  return helmet({
    contentSecurityPolicy: { directives: buildCsp(isProduction) },
    crossOriginEmbedderPolicy: false,
  });
}

export function applyRateLimits(app) {
  app.use(
    '/api/',
    rateLimit({
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: API_RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'error.rateLimit' },
    })
  );

  app.use(
    rateLimit({
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: GLOBAL_RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
}

export function createCors({ siteUrl, port }) {
  const allowedOrigins = [`http://localhost:${port}`, siteUrl];
  return cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true,
  });
}
