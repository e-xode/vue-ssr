# Environment variables

```
COMPOSE_FILE=docker-compose.yml:docker-compose.local.yml   # unset/commented = remote MongoDB
NODE_ENV=development
NODE_PORT=3002
NODE_HOST=http://localhost:3002
APP_NAME=vue-ssr
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

- `COOKIE_SECRET`: server refuses to start if missing/default in production
- CORS allowlist: `http://localhost:${NODE_PORT}` plus `NODE_HOST`, computed in `server.js` — there
  is no separate `CORS_ORIGIN` variable
- `NODE_HOST`: used for email links, canonical URLs, and absolute SEO metadata

## Gotchas

- CSP: Helmet CSP is production-conditional (disabled in dev for HMR/devtools)
- Captcha: gracefully degraded when `RECAPTCHA_SITE_KEY` is not set
- Error stack traces: hidden in production responses (shown only in dev)
