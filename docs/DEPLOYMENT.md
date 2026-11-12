# Deployment

The kit runs as a single Node.js process behind a TLS-terminating reverse proxy, with a MongoDB
database. This guide covers what the application needs; how you provision servers is up to you.

## Production checklist

The server **refuses to start** in production until the first three are right:

- [ ] `NODE_ENV=production`
- [ ] `NODE_HOST` is the public `https` origin (not `http`, not `localhost`). It feeds the CORS
      allowlist, canonical URLs, the sitemap and email links.
- [ ] `COOKIE_SECRET` is a random value of at least 32 characters (`openssl rand -hex 32`). The
      placeholders from the documentation are refused.
- [ ] `MONGO_*` point to the production database, with a user that has `readWrite` on it only.
- [ ] `MAILER_*` are set: security codes are sent by email only (the console transport of
      development never activates in production).
- [ ] `RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY` are set (see the first trap below).
- [ ] The reverse proxy forwards `X-Forwarded-For` and `X-Forwarded-Proto` (the application trusts
      exactly one proxy hop for the client IP and secure cookies).
- [ ] `logs/` and `public/uploads/` are persistent, writable directories.
- [ ] `GET /healthz` is the readiness probe.

## Two traps to know before the first deploy

**1. reCAPTCHA is mandatory in production.** Sign-up and the contact form verify a reCAPTCHA v3
token and fail closed: with no `RECAPTCHA_SECRET_KEY`, or when Google cannot be reached within 5
seconds, they answer `error.auth.captchaFailed`. A site deployed without keys looks healthy but
nobody can register. The server logs a warning at startup when a key is missing. Create the keys
at <https://www.google.com/recaptcha/admin> (type: v3).

**2. Every restart signs all users out.** Sessions are files in `logs/sessions/`, and they are
deleted at each production start. Deploying therefore ends every session. The file store also
limits you to one instance. If that is not acceptable, replace the store in
`src/api/http/session.js` (and remove the `clearSessionFiles()` call in `server.js`).

## Environment variables

`.env.example` documents every variable. Summary:

| Variable                                                | Required in production | Purpose                                             |
| ------------------------------------------------------- | ---------------------- | --------------------------------------------------- |
| `NODE_ENV`                                              | Yes                    | `production`                                        |
| `NODE_PORT`                                             | No (3002)              | Listening port                                      |
| `NODE_HOST`                                             | Yes                    | Public `https` origin                               |
| `COOKIE_SECRET`                                         | Yes                    | Session signing secret, 32+ characters              |
| `MONGO_TYPE`, `MONGO_HOST`, `MONGO_DB`, `MONGO_USER`, `MONGO_PWD` | Yes          | Database (`MONGO_TYPE=mongodb+srv` for Atlas)       |
| `MAILER_HOST`, `MAILER_PORT`, `MAILER_SSL`, `MAILER_LOGIN`, `MAILER_PASSWORD`, `MAILER_FROM` | Yes | SMTP                           |
| `MAILER_TO`                                             | No                     | Contact form recipient (default `MAILER_FROM`)      |
| `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`            | Yes                    | reCAPTCHA v3                                        |
| `RECAPTCHA_MIN_SCORE`                                   | No (0.5)               | Minimum accepted score                              |
| `APP_NAME`                                              | No (`App`)             | Name in titles, emails and structured data          |
| `BASE`                                                  | No (`/`)               | Public base path when served below the root         |
| `LOG_LEVEL`                                             | No (`info`)            | `error`, `warn`, `info` or `debug`                  |
| `GA_MEASUREMENT_ID`, `FACEBOOK_APP_ID`, `SOCIAL_*`      | No                     | Analytics and social metadata                       |

The MongoDB user must be defined in the `MONGO_DB` database (the connection string authenticates
against it, not against `admin`).

## Docker image

`docker/build/Dockerfile` is a multi-stage build: it installs the locked dependency tree, builds
the client and server bundles, then produces a slim image that runs as the non-root `node` user.

```bash
docker build -f docker/build/Dockerfile -t my-app .

docker run -d --name my-app \
  --env-file ./production.env \
  -p 127.0.0.1:3002:3002 \
  -v "$PWD/logs:/app/logs" \
  -v "$PWD/uploads:/app/public/uploads" \
  my-app
```

- The mounted directories must be writable by UID 1000.
- The image declares a `HEALTHCHECK` on `/healthz`.
- The process is supervised by `supervisord` inside the container; logs go to stdout and stderr.
- `NODE_HOST` in the image is a placeholder: always pass the real value at run time.

The repository's `docker-build.yml` workflow builds and pushes this image to GitHub Container
Registry when a `v*` tag is pushed.

## Without Docker

```bash
npm ci
npm run build
NODE_ENV=production node server.js   # with the production variables in the environment
```

`npm start` does the same through `cross-env`. It does not read `.env`: provide the variables
through your process manager (systemd, PM2…). Because production requires a public `https`
`NODE_HOST`, the production mode is not meant to be run on `localhost`.

## Reverse proxy

Any proxy works. Minimal nginx location:

```nginx
location / {
    proxy_pass http://127.0.0.1:3002;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Send a single client address in `X-Forwarded-For`; the application trusts one hop.

## Operations

- **Rate limiting** is active in production only and counts per client IP (see
  [API.md](./API.md)); static files are not counted.
- **Audit logs** in the `logs` collection expire after 90 days.
- **Shutdown** is graceful on `SIGTERM`: `/healthz` turns 503, in-flight requests finish, MongoDB
  closes; the process is forced to exit after 10 seconds.
- **Startup failures** exit with a non-zero code: unreachable database, port already in use,
  invalid `NODE_HOST` or `COOKIE_SECRET`.
- **Backups**: the MongoDB database and `public/uploads/`. Sessions need no backup.

## Updating

Releases follow semantic versioning; [CHANGELOG.md](../CHANGELOG.md) marks changes that need
action with ⚠️. A fork should read it before merging a new version of the kit.
