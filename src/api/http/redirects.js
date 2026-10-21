import {
  LOCALES,
  DEFAULT_LOCALE,
  findPageBySlug,
  localizedPath,
  pathLocaleMismatch,
} from '#src/shared/localizedRoutes.js';
import {
  REDIRECTABLE_METHODS,
  REDIRECT_SKIPPED_PREFIXES,
  HOME_REDIRECT_STATUS,
  CANONICAL_REDIRECT_STATUS,
} from '#src/api/http/constants.js';

export function pickLocaleFromHeader(header) {
  const candidates = String(header ?? '')
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const quality = params.map((param) => param.trim()).find((param) => param.startsWith('q='));
      const weight = quality ? Number.parseFloat(quality.slice(2)) : 1;
      return { language: tag.trim().toLowerCase().split('-')[0], weight };
    })
    .filter(({ language, weight }) => language && weight > 0)
    .sort((a, b) => b.weight - a.weight);
  const match = candidates.find(({ language }) => LOCALES.includes(language));
  return match ? match.language : DEFAULT_LOCALE;
}

function splitUrl(url) {
  const queryStart = url.indexOf('?');
  if (queryStart === -1) return { pathname: url, search: '' };
  return { pathname: url.slice(0, queryStart), search: url.slice(queryStart) };
}

function isRedirectablePath(pathname) {
  if (!pathname.startsWith('/') || pathname.startsWith('//')) return false;
  if (pathname.includes('\\')) return false;
  if (REDIRECT_SKIPPED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return false;
  const lastSegment = pathname.split('/').pop();
  return !lastSegment.includes('.');
}

function addMissingLocale(path) {
  const [firstSegment] = path.slice(1).split('/');
  if (LOCALES.includes(firstSegment)) return path;
  const page = findPageBySlug(path);
  if (!page) return path;
  const slug = path.slice(1);
  const locale = LOCALES.find((candidate) => page.slugs[candidate] === slug) || DEFAULT_LOCALE;
  return localizedPath(page.name, locale);
}

function canonicalPath(path) {
  return pathLocaleMismatch(path) || addMissingLocale(path);
}

export function resolveRedirect({ method, url, acceptLanguage }) {
  if (!REDIRECTABLE_METHODS.includes(method)) return null;
  const { pathname, search } = splitUrl(String(url ?? ''));
  if (!isRedirectablePath(pathname)) return null;

  if (pathname === '/') {
    return {
      status: HOME_REDIRECT_STATUS,
      location: `/${pickLocaleFromHeader(acceptLanguage)}${search}`,
      varyAcceptLanguage: true,
    };
  }

  const canonical = canonicalPath(pathname.replace(/\/+$/, ''));
  if (canonical === pathname) return null;
  return { status: CANONICAL_REDIRECT_STATUS, location: `${canonical}${search}` };
}

export function redirectMiddleware(req, res, next) {
  const redirect = resolveRedirect({
    method: req.method,
    url: req.originalUrl,
    acceptLanguage: req.headers['accept-language'],
  });
  if (!redirect) return next();
  if (redirect.varyAcceptLanguage) res.vary('Accept-Language');
  return res.redirect(redirect.status, redirect.location);
}
