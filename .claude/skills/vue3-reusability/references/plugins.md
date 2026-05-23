# Plugins

A plugin is self-contained code that adds **app-level functionality** once, at app creation. Use it to register globals (components, directives), provide app-level resources, or wire a library — not to share per-component logic.

➜ See skill: vue3-composition — for reusable stateful logic, write a composable, not a plugin.

## The install contract

A plugin is either an object with an `install(app, options)` method, or a function used directly as the install function.

```js
export default {
  install(app, options) {
    app.directive('focus', { mounted: (el) => el.focus() });
    app.provide('appConfig', options);
  },
};
```

```js
export default function (app, options) {
  app.provide('appConfig', options);
}
```

`app.use(plugin, options)` calls `install(app, options)`. Calling `use()` twice with the same plugin is a no-op.

## Registering it

This project wires plugins in `src/main.js`. Existing plugins (`router`, `vuetify`, `pinia`, `i18n`) are already chained — add new ones the same way:

```js
app.use(router).use(vuetify).use(pinia).use(i18n).use(myPlugin, { theme: 'light' });
```

Keep the plugin file in `src/plugins/`. The project's convention is a **factory export** that builds the plugin (see `src/plugins/vuetify.js` → `createApplicationVuetify(ssr)`), which keeps SSR/client config explicit.

```js
export function createMyPlugin(options = {}) {
  return {
    install(app) {
      app.provide('appConfig', options);
    },
  };
}
```

## What a plugin typically does

**Register global directives or components:**

```js
install(app) {
  app.directive('focus', { mounted: (el) => el.focus() })
  app.component('AppLogo', AppLogo)
}
```

**Provide an app-level resource** (consumed with `inject` anywhere in the tree):

```js
install(app, options) {
  app.provide('appConfig', options)
}
```

```js
import { inject } from 'vue';

const appConfig = inject('appConfig');
```

**Add a global property — sparingly** (`app.config.globalProperties`):

```js
install(app, options) {
  app.config.globalProperties.$format = (n) => n.toLocaleString(options.locale)
}
```

Prefer `provide`/`inject` or a composable. Global properties are implicit, hard to trace, and clash easily — reserve them for genuinely ubiquitous helpers.

## SSR considerations

`install()` runs during `createApp` on **both** server and client (see `createApp()` in `src/main.js`). Therefore:

- Guard browser APIs with `typeof window !== 'undefined'`; never touch `window`, `document`, or `localStorage` unconditionally in `install`.
- For per-render behavior (theme, locale), accept it through `options` rather than reading the environment inside the plugin.
- Anything DOM-related belongs in a directive's client-only hooks, not in `install`.

```js
export function createAnalytics(options = {}) {
  return {
    install(app) {
      app.provide('analytics', options);
      if (typeof window === 'undefined') return;
      window.__analyticsId = options.id;
    },
  };
}
```

➜ See skill: vue-ssr-architecture — SSR lifecycle and how `main.js` builds the app on server vs client.
➜ See skill: vuetify-components — Vuetify is installed as a plugin; follow its factory pattern for new plugins.
