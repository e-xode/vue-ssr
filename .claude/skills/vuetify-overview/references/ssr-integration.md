# SSR integration

Vuetify must be instantiated with the `ssr` flag on the server.

```javascript
import { createApplicationVuetify } from '@/plugins/vuetify';

const vuetify = createApplicationVuetify(true);
app.use(vuetify);
```

On the client, pass `false` (or omit):

```javascript
const vuetify = createApplicationVuetify(false);
```

This ensures hydration works correctly. The SSR flag disables client-only features (transitions, `window`/`document` access) during server rendering, and prevents server/client output mismatch.

Full detail (why each behavior matters, entry-server/entry-client wiring): `vuetify-theming`'s `references/ssr-instantiation.md`.
