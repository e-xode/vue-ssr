# SSR integration

Vuetify is instantiated once, inside `createApp()` in `src/main.js`, with the `ssr` flag derived from the environment:

```javascript
const ssr = typeof window === 'undefined';
const vuetify = createApplicationVuetify(ssr, theme, startLocale);
```

`createApplicationVuetify(ssr, theme, locale)` (in `src/plugins/vuetify.js`) takes the SSR flag, the theme name (`light`/`dark`, from the `theme` cookie on the server) and the locale. Entry points do not call it; `entry-server.js` and `entry-client.js` call `createApp({ theme, locale, initialState })`, which returns `vuetify` and a `setLocale()` that updates both vue-i18n and Vuetify.

This ensures hydration works correctly. The SSR flag disables client-only features (transitions, `window`/`document` access) during server rendering, and prevents server/client output mismatch.

Full detail (why each behavior matters, entry-server/entry-client wiring): `vuetify-theming`'s `references/ssr-instantiation.md`.
