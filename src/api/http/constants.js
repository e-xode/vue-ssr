export const SESSION_IDLE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const SESSION_FALLBACK_SECRET = 'change-me-in-production';

export const SESSION_SECRET_MIN_LENGTH = 32;

export const SESSION_PLACEHOLDER_SECRETS = [
  SESSION_FALLBACK_SECRET,
  'your-secret-key-change-in-production',
];

export const SESSION_SECRET_FIX_HINT =
  'Set COOKIE_SECRET to a random value of at least 32 characters, for example with: openssl rand -hex 32';

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export const API_RATE_LIMIT_MAX = 300;

export const GLOBAL_RATE_LIMIT_MAX = 500;

export const UPLOADS_URL_PATH = '/uploads';

export const UPLOADS_DIR = 'public/uploads';

export const UPLOADS_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const CLIENT_DIST_DIR = './dist/client';

export const HASHED_ASSETS_URL_SEGMENT = 'assets';

export const HASHED_ASSETS_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

export const STATIC_FILES_MAX_AGE_SECONDS = 24 * 60 * 60;

export const SHUTDOWN_TIMEOUT_MS = 10 * 1000;

export const HEALTH_PATH = '/healthz';

export const API_PATH_PREFIX = '/api';

export const API_ERROR_KEYS = {
  401: 'error.unauthorized',
  403: 'error.forbidden',
  404: 'error.notFound',
  429: 'error.rateLimit',
};

export const DEFAULT_CLIENT_ERROR_KEY = 'error.validation';

export const DEFAULT_SERVER_ERROR_KEY = 'error.server';

export const REDIRECTABLE_METHODS = ['GET', 'HEAD'];

export const REDIRECT_SKIPPED_PREFIXES = [
  '/api',
  '/assets/',
  '/uploads/',
  '/@',
  '/src/',
  '/node_modules/',
];

export const HOME_REDIRECT_STATUS = 302;

export const ROUTE_REDIRECT_STATUS = 302;

export const CANONICAL_REDIRECT_STATUS = 301;

export const TEMPLATE_MARKER_PATTERN = /<!--app-(lang|theme|head|state|html)-->/g;

export const SSR_ENTRY_SERVER_PATH = 'dist/server/entry-server.js';

export const SSR_DEV_ENTRY_PATH = '/src/entry-server.js';

export const API_DEV_ROUTER_PATH = '/src/api/router.js';

export const DEV_INDEX_HTML_PATH = './index.html';

export const PROD_INDEX_HTML_PATH = './dist/client/index.html';

export const NO_STORE_CACHE_CONTROL = 'no-store';
