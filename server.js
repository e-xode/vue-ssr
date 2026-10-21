import http from 'node:http';
import express from 'express';
import { logInfo, logWarn } from '#src/shared/log.js';
import { mongoConnect, mongoClose } from '#src/shared/mongo.js';
import { assertProductionSiteUrl, resolveSiteUrl } from '#src/shared/siteUrl.js';
import { ensureIndexes } from '#src/api/http/indexes.js';
import {
  assertProductionSecret,
  clearSessionFiles,
  createSessionMiddleware,
} from '#src/api/http/session.js';
import { createHelmet, applyRateLimits, createCors } from '#src/api/http/hardening.js';
import { createReadiness, createHealthHandler } from '#src/api/http/readiness.js';
import { setupSeoRoutes } from '#src/api/http/seo.js';
import { mountUploads, mountClientBundle } from '#src/api/http/static.js';
import { mountDevMiddlewares, mountProductionApi } from '#src/api/http/dev.js';
import { redirectMiddleware } from '#src/api/http/redirects.js';
import { createSsrRenderer, readProductionTemplate } from '#src/api/http/ssr.js';
import { createShutdown } from '#src/api/http/shutdown.js';
import { HEALTH_PATH } from '#src/api/http/constants.js';

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.NODE_PORT || 3002;
const base = process.env.BASE || '/';

assertProductionSiteUrl(process.env);
assertProductionSecret(process.env);

const { db, error } = await mongoConnect();
if (!db || error) {
  logWarn(`Database connection failed: ${error}`);
  process.exit(1);
}

await ensureIndexes(db);
if (isProduction) await clearSessionFiles();

const siteUrl = resolveSiteUrl(process.env);
const readiness = createReadiness();
const templateHtml = isProduction ? await readProductionTemplate() : '';

const app = express();
app.set('trust proxy', 1);
const httpServer = http.createServer(app);

app.use(createHelmet(isProduction));
app.get(HEALTH_PATH, createHealthHandler(readiness));
if (isProduction) applyRateLimits(app);

setupSeoRoutes(app, { db, siteUrl });

app.use(createSessionMiddleware({ isProduction, secret: process.env.COOKIE_SECRET }));
app.use(createCors({ siteUrl, port }));
app.use(express.json());

let vite = null;
if (isProduction) {
  await mountProductionApi(app, db);
  mountUploads(app);
  await mountClientBundle(app, base);
} else {
  vite = await mountDevMiddlewares(app, { httpServer, db, base });
}

app.use(redirectMiddleware);

const ssr = createSsrRenderer({ isProduction, vite, templateHtml, base, db });
app.use('*all', ssr.handle);

await ssr.warmUp();

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logWarn(`Port ${port} already in use`);
  } else {
    throw err;
  }
});

httpServer.listen(port, () => {
  readiness.setReady(true);
  logInfo(`Server started at http://localhost:${port}`);
});

const shutdown = createShutdown({ httpServer, closeResources: mongoClose, readiness });
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
