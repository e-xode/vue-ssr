export const TITLE_SEPARATOR = ' — ';

export function buildTitle(pageTitle, appName) {
  if (!pageTitle) return appName;
  if (!appName || pageTitle.includes(appName)) return pageTitle;
  return `${pageTitle}${TITLE_SEPARATOR}${appName}`;
}
