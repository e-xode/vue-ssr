# Routing — locale-prefixed

All routes are prefixed with `/:locale(en|fr)/`. The locale is extracted from the URL.

## Route table

```
/                       -> redirects to /{savedLocale} or /{browserLang} or /en
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
2. **Root redirect**: / → /{savedLocale} → /{browserLang} → /en.
3. **Composable** (useLocalePath.js): `localePath(path)` returns `/{locale}{path}`, `switchLocale(code)` replaces locale in URL.
4. **entry-client.js**: afterEach syncs route.params.locale → i18n + localStorage.
5. **entry-server.js**: Extracts locale from route params, generates hreflang tags.
6. **All links** use `:to="localePath('/path')"` — never hardcoded paths.

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
