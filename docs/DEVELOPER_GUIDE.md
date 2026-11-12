# Developer guide

How to extend the kit. Read [ARCHITECTURE.md](./ARCHITECTURE.md) first for the big picture and
[CONTRIBUTING.md](../CONTRIBUTING.md) for the conventions the linter and reviewers enforce.

## Add a page

1. Create `src/views/Pricing/PricingView.vue` (and `PricingView.scss` if it has styles):

   ```vue
   <script setup>
   import { useI18n } from 'vue-i18n';

   const { t } = useI18n();
   </script>

   <template>
     <v-container>
       <h1>{{ t('pricing.title') }}</h1>
     </v-container>
   </template>

   <style lang="scss" scoped src="./PricingView.scss"></style>
   ```

2. Declare the route in the `localeRoutes` array of `src/router.js`:

   ```js
   {
     path: 'pricing',
     name: 'Pricing',
     component: () => import('@/views/Pricing/PricingView.vue'),
     meta: {
       layout: 'public',
       title: 'meta.pricing.title',
       description: 'meta.pricing.description',
     },
   },
   ```

   Add `requiresAuth: true` (and `requiresAdmin: true`) for a private page; such routes are
   `noindex` automatically.

3. Add the texts to **both** `src/translate/en.json` and `src/translate/fr.json`
   (`pricing.title`, `meta.pricing.title`, `meta.pricing.description`).
4. Link to it with `localePath('/pricing')` from `useLocalePath()`.
5. For a public page with a different slug per language, or to list it in the sitemap, add it to
   `PAGES` in `src/shared/localizedRoutes.js`.

## Add an API endpoint

1. Create `src/api/notes/list.js`:

   ```js
   import { requireAuth } from '#src/api/middleware.js';
   import { parsePagination } from '#src/shared/dbHelpers.js';

   export function setupListNotesRoute(app, db) {
     app.get('/api/notes', requireAuth, async (req, res) => {
       try {
         const { limit, skip } = parsePagination(req.query);
         const notes = await db
           .collection('notes')
           .find({ userId: req.userId })
           .skip(skip)
           .limit(limit)
           .toArray();
         res.json({ notes });
       } catch (err) {
         console.error('List notes error:', err);
         res.status(500).json({ error: 'error.server' });
       }
     });
   }
   ```

2. Register it in `src/api/router.js` (`setupListNotesRoute(router, db)`), with a rate limiter if
   it is sensitive.
3. Follow the rules the existing routes follow:
   - read inputs with `readString`, `readTrimmed` or `readEmail` (`src/shared/utils.js`), never
     straight from `req.body`: an object there may be a MongoDB operator;
   - parse ids with `parseObjectId` before querying;
   - answer errors as `{ error: 'error.some.key' }` and add the key to both translation files;
   - return users only through `findUserSafe` or `USER_SAFE_PROJECTION`;
   - protect admin routes with `requireAuth, requireAdmin`, in that order.
4. Call it from the client with `apiFetch('/api/notes')` (`src/shared/api.js`).
5. Add a test in `tests/unit/api.notes.test.js` using `tests/fixtures/routeHarness.js`.

## Add a translation or a language

Texts live in `src/translate/en.json` and `fr.json`, with identical keys. Use `t('key')` in
templates; never hard-code user-visible text. To add a language, add it to `SUPPORTED_LOCALES` in
`src/shared/const.js`, create `src/translate/<code>.json` and
`src/translate/emails/<code>.js`, and register both where `en` and `fr` are imported.

## Add a store or a composable

Stores are Pinia setup stores in `src/stores/` (see `auth.js`). Reusable logic goes in
`src/composables/useSomething.js`. Both run during SSR: touch `window`, `document` or
`localStorage` only inside `onMounted` or behind `typeof window !== 'undefined'`.

To load data during SSR, give the route a `meta.prefetch({ route, pinia, ssrContext })` function;
on the server `ssrContext.db` is the database handle, and the resulting Pinia state is serialized
into the page.

## Styling

- Design tokens are SCSS variables in `src/styles/variables.scss`; they and the mixins are
  injected into every component stylesheet. Do not hard-code colours, spacing or font sizes.
- One `.scss` file per component, referenced with `<style lang="scss" scoped src="…">`.
- The Vuetify theme (light and dark palettes, component defaults) is in `src/plugins/vuetify.js`.
- Icons come from `@mdi/js` as imported SVG paths, not from an icon font.

## Emails

Templates are functions in `src/translate/emails/en.js` and `fr.js`, built on the shared shell in
`emails/layout.js`. Add a sender next to the existing ones in `src/shared/email.js`.

## Everyday commands

```bash
npm run dev                 # development server
npm run test:watch          # tests in watch mode
npm run validate:changed    # lint (with autofix), format check, build and tests for your changes
npm run validate            # the full battery, as CI runs it
```

Test and lint conventions: [TESTING.md](../TESTING.md) and [CONTRIBUTING.md](../CONTRIBUTING.md).
