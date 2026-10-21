export const DEFAULT_NODE_PORT = 3002;

export const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]', '::1', '0.0.0.0'];

export const SITE_URL_FIX_HINT =
  'Set NODE_HOST to the public https origin of the site (for example https://www.example.com). It must not be missing, use http, or point to localhost, 127.0.0.1 or ::1.';

function readHost(env) {
  return String(env?.NODE_HOST ?? '').trim();
}

function parseUrl(value) {
  return URL.canParse(value) ? new URL(value) : null;
}

export function isPublicHttpsOrigin(value) {
  const url = parseUrl(value);
  if (!url) return false;
  return url.protocol === 'https:' && !LOCAL_HOSTNAMES.includes(url.hostname);
}

export function assertProductionSiteUrl(env) {
  if (env?.NODE_ENV !== 'production') return;
  const host = readHost(env);
  if (!isPublicHttpsOrigin(host)) {
    throw new Error(`Invalid NODE_HOST "${host}" in production. ${SITE_URL_FIX_HINT}`);
  }
}

export function resolveSiteUrl(env) {
  const host = readHost(env);
  if (host) return host.replace(/\/+$/, '');
  if (env?.NODE_ENV === 'production') {
    throw new Error(`NODE_HOST is missing in production. ${SITE_URL_FIX_HINT}`);
  }
  return `http://localhost:${env?.NODE_PORT || DEFAULT_NODE_PORT}`;
}
