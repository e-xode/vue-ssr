# Routing — locale-prefixed

All routes are prefixed with `/:locale(en|fr)/`. The locale is extracted from the URL.

## Route table

```
/                       -> server 302 to /{Accept-Language match} or /en (client router fallback: saved locale, browser language)
/en/                    -> IndexView (public)
/en/signup              -> SignupView (minimal, guest)
/en/signin              -> SigninView (minimal, guest)
/en/auth/verify-code    -> VerifyCodeView (minimal)
/en/forgot-password     -> ForgotPasswordView (minimal, guest)
/en/reset-password      -> ResetPasswordView (minimal, guest)
/en/dashboard           -> DashboardView (app, requiresAuth)
/en/account             -> AccountView (app, requiresAuth)
/en/contact             -> ContactView (public)
/en/admin               -> redirects to /en/admin/users
/en/admin/users         -> AdminUsersView (app, requiresAuth, requiresAdmin)
/en/admin/users/:userId -> AdminUserDetailView (app, requiresAuth, requiresAdmin)
/en/admin/logs          -> AdminLogsView (app, requiresAuth, requiresAdmin)
/:pathMatch(.*)*        -> NotFoundView (404 status)
```

## How locale routing works

1. **Router** (router.js): Routes defined as `localeRoutes[]` (no leading /), wrapped in parent `/:locale()`.
2. **Root redirect**: the server answers `/` with a 302 chosen from `Accept-Language` (`src/api/http/redirects.js`); the client router redirect (saved locale → browser language → `/en`) is the fallback for in-app navigation.
2b. **Canonical redirects**: the server 301s a known page path without locale prefix, a slug in the wrong locale, or a trailing slash to the canonical localized path.
3. **Composable** (useLocalePath.js): `localePath(path)` returns `/{locale}{path}` with the slug localized through `localizeSubPath`, `switchLocale(code)` replaces locale (and slug) in the URL.
4. **entry-client.js**: afterEach syncs route.params.locale → i18n + localStorage.
5. **entry-server.js**: Extracts locale from route params, calls `setLocale`, generates hreflang tags (`src/ssr/head.js`).
6. **All links** use `:to="localePath('/path')"` — never hardcoded paths.

## Localized slugs

`PAGES` in `src/shared/localizedRoutes.js` maps a page name to one slug per locale (today `Index` and `Contact`, identical in `en` and `fr`). `router.js` builds those routes with `pageRoute(name)` (extra slugs become aliases), and the redirects, hreflang tags and sitemap read the same table. A page that is not in `PAGES` (signup, dashboard, ...) keeps one slug for every locale.

## Adding a new route

```js
{
    path: 'my-page',
    name: 'MyPage',
    component: () => import('@/views/MyPage/MyPageView.vue'),
    meta: {
        layout: 'public',
        title: 'meta.myPage.title',
        description: 'meta.myPage.description',
    }
}
```

## i18n

- `src/translate/en.json`, `fr.json` — UI translations
- `src/translate/emails/en.js`, `fr.js` — Email templates
- Adding a language: create xx.json, emails/xx.js, add to SUPPORTED_LOCALES in const.js, import in main.js
