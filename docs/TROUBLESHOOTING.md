# Troubleshooting

## Startup

**`Database connection failed` and the process exits.**
MongoDB is unreachable or refuses the credentials.

- With Docker: `docker compose ps` must show the `mongo` service as healthy. `COMPOSE_FILE` in
  `.env` must include `docker-compose.local.yml`.
- `Authentication failed` without Docker: the user must be defined in the `MONGO_DB` database, not
  in `admin`. See [QUICK_START.en.md](./QUICK_START.en.md#without-docker). For a local MongoDB
  without authentication, leave `MONGO_USER` and `MONGO_PWD` empty.
- You changed `MONGO_USER` or `MONGO_PWD` after the first start: the user was created with the old
  values. Reset the development database with `docker compose down -v` (this deletes its data).

**`Server could not listen: port 3002 is already in use`.**
Another process uses the port. Change `NODE_PORT` (and `NODE_HOST`) in `.env`, or stop the other
process. With Docker, `MONGO_PORT` does the same for 27017.

**`Invalid NODE_HOST … in production` or `COOKIE_SECRET is too weak for production`.**
Production requires a public `https` origin and a random secret of 32+ characters. See
[DEPLOYMENT.md](./DEPLOYMENT.md). To work locally, use `npm run dev`, not the production mode.

**`set SHARED_NETWORK to the name of an existing Docker network`.**
`docker-compose.network.yml` is listed in `COMPOSE_FILE` but `SHARED_NETWORK` is empty. Set it, or
remove the file from `COMPOSE_FILE`.

**The Docker container keeps reinstalling or uses stale dependencies.**
The install runs when `package-lock.json` changes. Force it with
`docker compose exec node rm node_modules/.lock-hash` and restart the container.

## Signing in

**No email arrives in development.**
Expected: without `MAILER_HOST`, nothing is sent and the code is printed in the server logs
(`docker compose logs node`, or the terminal running `npm run dev`).

**`error.emailFailed` (502).**
The SMTP server refused the message. Check the `MAILER_*` values; the server log has the SMTP error.
`MAILER_SSL=true` is for implicit TLS (usually port 465); use `false` with port 587 (STARTTLS).

**"Invalid code" although the code is right.**
A code is valid 10 minutes and for 3 attempts, and only the most recent one works. After 10 wrong
codes within an hour the account is locked for code verification until the hour has passed.

**Sign-up or the contact form answers `error.auth.captchaFailed` in production.**
`RECAPTCHA_SITE_KEY` or `RECAPTCHA_SECRET_KEY` is missing or wrong, the keys are not v3 keys, or the
domain is not allowed for the key. The server logs a warning at startup when a key is missing.

**Everyone was signed out.**
Sessions are cleared at every production start. See [DEPLOYMENT.md](./DEPLOYMENT.md).

**The admin menu does not appear.**
Promote the account with `npm run seed:admin -- you@example.com`, then sign out and in again.

**429 `error.rateLimit`.**
Production rate limits were reached; they reset after 15 minutes. If every visitor shares one
limit, the reverse proxy is not forwarding the client address in `X-Forwarded-For`.

## Development

**Changes are not picked up inside Docker.**
Some bind mounts do not deliver file events. Set `VITE_USE_POLLING=true` in `.env`.

**`Blocked request. This host is not allowed.`**
Add the hostname to `VITE_ALLOWED_HOSTS` in `.env`.

**An edit under `src/api/http/` has no effect.**
Those modules are loaded once. Restart the dev server (`docker compose restart node`).

**Hydration mismatch warnings.**
Server and browser rendered different markup: usually a browser-only value (`window`,
`localStorage`, the current date) used during render. Move it to `onMounted`.

**`npm run validate:changed` prints "skipped".**
It only checks uncommitted changes. Use `npm run validate` for the whole repository.

## Still stuck

Search or open an issue: <https://github.com/e-xode/vue-ssr/issues>. Include the Node.js version,
the command, and the server log.
