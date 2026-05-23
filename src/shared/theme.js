export const THEME_COOKIE = 'theme';

export const THEMES = ['light', 'dark'];

export const DEFAULT_THEME = 'light';

export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isValidTheme(value) {
  return THEMES.includes(value);
}

export function parseThemeCookie(cookieHeader) {
  if (!cookieHeader) {
    return DEFAULT_THEME;
  }
  const entry = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${THEME_COOKIE}=`));
  const value = entry ? entry.slice(THEME_COOKIE.length + 1) : '';
  return isValidTheme(value) ? value : DEFAULT_THEME;
}
