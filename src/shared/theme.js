export const THEME_COOKIE = 'theme';

export const THEMES = ['light', 'dark'];

export const DEFAULT_THEME = 'light';

export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isValidTheme(value) {
  return THEMES.includes(value);
}

export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function readThemeCookie(cookieHeader) {
  if (!cookieHeader) {
    return '';
  }
  const entry = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${THEME_COOKIE}=`));
  return entry ? entry.slice(THEME_COOKIE.length + 1) : '';
}

export function parseThemeCookie(cookieHeader) {
  const value = readThemeCookie(cookieHeader);
  return isValidTheme(value) ? value : DEFAULT_THEME;
}

export function hasThemeChoice(cookieHeader) {
  return isValidTheme(readThemeCookie(cookieHeader));
}

export function applyDocumentTheme(name) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.remove(...THEMES.map((theme) => `v-theme--${theme}`));
  document.documentElement.classList.add(`v-theme--${name}`);
}
