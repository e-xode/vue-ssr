import fs from 'node:fs/promises';
import session from 'express-session';
import sessionFileStore from 'session-file-store';
import { logInfo } from '#src/shared/log.js';
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_BASE_OPTIONS,
  SESSION_DIR,
} from '#src/shared/const.js';
import { SESSION_IDLE_MAX_AGE_MS, SESSION_FALLBACK_SECRET } from '#src/api/http/constants.js';

export function assertProductionSecret(env) {
  if (env.NODE_ENV === 'production' && !env.COOKIE_SECRET) {
    throw new Error('COOKIE_SECRET environment variable is required in production');
  }
}

export async function clearSessionFiles() {
  const files = await fs.readdir(SESSION_DIR).catch((err) => {
    if (err.code !== 'ENOENT') console.error(err);
    return [];
  });
  const sessionFiles = files.filter((file) => file.endsWith('.json'));
  for (const file of sessionFiles) {
    await fs.unlink(`${SESSION_DIR}/${file}`).catch((err) => console.error(err));
  }
  logInfo(`Cleared ${sessionFiles.length} session(s)`);
}

export function createSessionMiddleware({ isProduction, secret }) {
  const FileStore = sessionFileStore(session);

  return session({
    store: new FileStore({ path: SESSION_DIR }),
    cookie: {
      ...SESSION_COOKIE_BASE_OPTIONS,
      maxAge: SESSION_IDLE_MAX_AGE_MS,
      secure: isProduction,
    },
    name: SESSION_COOKIE_NAME,
    resave: false,
    saveUninitialized: false,
    secret: secret || SESSION_FALLBACK_SECRET,
  });
}
