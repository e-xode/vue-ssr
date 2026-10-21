# Environment variables

```
COMPOSE_FILE=docker-compose.yml:docker-compose.local.yml   # unset/commented = remote MongoDB
NODE_ENV=development
NODE_PORT=3002
NODE_HOST=http://localhost:3002        # public https origin in production
APP_NAME=vue-ssr                       # titles and structured data (default App)
BASE=/                                 # public base path when served below the root
LOG_LEVEL=info                         # error | warn | info | debug
BIND_ADDRESS=127.0.0.1                 # host interface for published dev ports
VITE_USE_POLLING=false                 # true when bind mounts miss inotify events
COOKIE_SECRET=your-secret              # MUST be set in production

MONGO_TYPE=mongodb                     # mongodb (local) | mongodb+srv (Atlas)
MONGO_HOST=mongo                       # container name (local) or Atlas host
MONGO_USER=user
MONGO_PWD=password
MONGO_DB=vue-ssr

MAILER_HOST=smtp.example.com
MAILER_PORT=587
MAILER_SSL=false
MAILER_LOGIN=user@example.com
MAILER_PASSWORD=your-password
MAILER_FROM=no-reply@example.com
MAILER_TO=contact@example.com          # contact-form recipient

GA_MEASUREMENT_ID=G-XXXXXXXXXX         # Google Analytics 4 measurement ID
RECAPTCHA_SITE_KEY=6Le...              # reCAPTCHA v3 site key (client)
RECAPTCHA_SECRET_KEY=6Le...            # reCAPTCHA v3 secret key (server)
RECAPTCHA_MIN_SCORE=0.5                # below this score, treat as bot
FACEBOOK_APP_ID=123456789              # Facebook Open Graph app_id
SOCIAL_FACEBOOK=https://facebook.com/yourpage
SOCIAL_INSTAGRAM=https://instagram.com/yourpage
SOCIAL_TELEGRAM=https://t.me/yourchannel
```

`MONGO_USER`/`MONGO_PWD`/`MONGO_DB` stay the same across the local/remote switch — only
`MONGO_HOST`/`MONGO_TYPE` differ, and `docker-compose.local.yml` overrides those two automatically.
See the `vue-ssr-deployment` skill for the full local-vs-remote mechanics.

## Production requirements

- `COOKIE_SECRET`: the server refuses to start if it is missing in production
- `NODE_HOST`: must be a public `https` origin (not localhost/127.0.0.1/::1, not `http`), or the
  server refuses to boot (`assertProductionSiteUrl`). Used for the CORS allowlist, email links,
  canonical URLs, sitemap and absolute SEO metadata
- CORS allowlist: `http://localhost:${NODE_PORT}` plus `NODE_HOST`, built in
  `src/api/http/hardening.js` - there is no separate `CORS_ORIGIN` variable
- `RECAPTCHA_SECRET_KEY`: required in production, signup and contact are refused without it
- Session lifetime: `SESSION_ABSOLUTE_MAX_AGE_MS` (30 days) is a constant in `src/shared/const.js`,
  not an env var

## Gotchas

- CSP: Helmet CSP is active in every mode; dev only adds `'unsafe-inline'`/`'unsafe-eval'` scripts and
  `ws:`/`wss:` for Vite HMR. Production `script-src` has no `'unsafe-inline'`
- `GA_MEASUREMENT_ID` and `RECAPTCHA_SITE_KEY` are exposed as `<meta name="ga-id">` and
  `<meta name="recaptcha-site-key">` (only when they match the expected format); client code loads
  the scripts. Without them analytics and captcha tokens are skipped client-side
- reCAPTCHA verification passes outside production and fails closed in production (missing secret,
  missing token or low score is a rejection)
- Error stack traces: hidden in production responses (shown only in dev)
