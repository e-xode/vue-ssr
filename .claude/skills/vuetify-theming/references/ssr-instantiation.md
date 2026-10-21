# SSR-safe instantiation

`createApplicationVuetify(ssr, theme, locale)` (exported from `src/plugins/vuetify.js`) is called by `createApp()` in `src/main.js`, never by the entry files directly:

```javascript
const ssr = typeof window === 'undefined';
const theme = initialTheme || (ssr ? DEFAULT_THEME : parseThemeCookie(document.cookie));
const vuetify = createApplicationVuetify(ssr, theme, startLocale);
app.use(vuetify);
```

- Server (`entry-server.js`): `createApp({ theme, locale })`, where `theme` comes from the `theme` cookie parsed in `src/api/http/ssr.js` (`parseThemeCookie`) so the first paint already uses the right theme.
- Client (`entry-client.js`): `createApp({ initialState })`; the theme is read from `document.cookie`. With no theme cookie, `useSystemTheme().applySystemPreference()` switches to dark when the OS prefers it.
- Locale changes go through the `setLocale()` returned by `createApp()`, which updates vue-i18n and `vuetify.locale.current`.

The `ssr` flag:

- Disables transitions during server render
- Prevents client-only API access (`window`, `document`)
- Ensures proper hydration matching between server and client output
