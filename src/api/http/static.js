import path from 'node:path';
import express from 'express';
import {
  UPLOADS_URL_PATH,
  UPLOADS_DIR,
  UPLOADS_MAX_AGE_MS,
  CLIENT_DIST_DIR,
  HASHED_ASSETS_URL_SEGMENT,
  HASHED_ASSETS_MAX_AGE_SECONDS,
  STATIC_FILES_MAX_AGE_SECONDS,
} from '#src/api/http/constants.js';

export function mountUploads(app) {
  app.use(
    UPLOADS_URL_PATH,
    express.static(UPLOADS_DIR, {
      dotfiles: 'deny',
      index: false,
      maxAge: UPLOADS_MAX_AGE_MS,
    })
  );
  app.use(UPLOADS_URL_PATH, (req, res) => res.sendStatus(404));
}

export async function mountClientBundle(app, base) {
  const compression = (await import('compression')).default;
  const sirv = (await import('sirv')).default;

  app.use(compression());
  app.use(
    path.posix.join(base, HASHED_ASSETS_URL_SEGMENT),
    sirv(path.join(CLIENT_DIST_DIR, HASHED_ASSETS_URL_SEGMENT), {
      extensions: [],
      maxAge: HASHED_ASSETS_MAX_AGE_SECONDS,
      immutable: true,
    })
  );
  app.use(base, sirv(CLIENT_DIST_DIR, { extensions: [], maxAge: STATIC_FILES_MAX_AGE_SECONDS }));
}
