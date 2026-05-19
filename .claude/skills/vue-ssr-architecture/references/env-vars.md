# Environment variables

```
MONGO_URI=mongodb://localhost:27017
DB_NAME=vue-ssr
NODE_HOST=http://localhost:5173
APP_NAME=vue-ssr
COOKIE_SECRET=your-secret              # MUST be set in production
MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM
CONTACT_EMAIL=contact@example.com
CORS_ORIGIN=http://localhost:5173
GA_MEASUREMENT_ID=G-XXXXXXXXXX         # Google Analytics 4 measurement ID
RECAPTCHA_SITE_KEY=6Le...              # reCAPTCHA v3 site key (client)
RECAPTCHA_SECRET_KEY=6Le...            # reCAPTCHA v3 secret key (server)
FACEBOOK_APP_ID=123456789              # Facebook Open Graph app_id
```

## Production requirements

- `COOKIE_SECRET`: Server refuses to start if missing/default in production
- `CORS_ORIGIN`: Must match the production domain
- `NODE_HOST`: Used for email links and absolute URLs

## Gotchas

- CSP: Helmet CSP is production-conditional (disabled in dev for HMR/devtools)
- Captcha: Gracefully degraded when RECAPTCHA_SITE_KEY is not set
- Error stack traces: Hidden in production responses (shown only in dev)
