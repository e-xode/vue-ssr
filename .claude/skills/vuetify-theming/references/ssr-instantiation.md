# SSR-safe instantiation

`createApplicationVuetify` (exported from `src/plugins/vuetify.js`) accepts an `ssr` boolean:

```javascript
import { createApplicationVuetify } from '@/plugins/vuetify';
```

Server-side (`entry-server.js`):

```javascript
const vuetify = createApplicationVuetify(true);
app.use(vuetify);
```

Client-side (`entry-client.js`):

```javascript
const vuetify = createApplicationVuetify(false);
app.use(vuetify);
```

The `ssr` flag:

- Disables transitions during server render
- Prevents client-only API access (`window`, `document`)
- Ensures proper hydration matching between server and client output
