# Quick start

Version française : [QUICK_START.fr.md](./QUICK_START.fr.md)

## With Docker (recommended)

Requirements: Docker with the Compose plugin (`docker compose version`).

```bash
git clone https://github.com/e-xode/vue-ssr.git
cd vue-ssr
cp .env.example .env
docker compose up
```

`COMPOSE_FILE` in `.env` selects two files: `docker-compose.yml` (the Node.js container) and
`docker-compose.local.yml` (a MongoDB 8 container, whose application user is created on first start
from `MONGO_USER`, `MONGO_PWD` and `MONGO_DB`). The application listens on <http://localhost:3002>
and MongoDB on `127.0.0.1:27017`; both ports are published on the loopback interface only.

The Node.js container runs `npm install` on its first start (and again whenever
`package-lock.json` changes), then `npm run dev`.

### First account and first admin

1. Open <http://localhost:3002/en/signup> and create an account.
2. The security code is printed in the server logs, because no SMTP server is configured:

   ```
   [mail:dev] … code for you@example.com: 123456
   ```

3. Promote the account, then sign out and sign in again:

   ```bash
   docker compose exec node npm run seed:admin -- you@example.com
   ```

There is no default admin account and no default password.

### Why the development container has extra privileges

`docker-compose.yml` grants the Node.js container `SYS_ADMIN`, an unconfined seccomp profile and
2 GB of shared memory. They exist only so that headless Chromium (Playwright, used by the optional
screenshot tooling) can run inside the container. They are not needed to run the application:
remove the `cap_add`, `security_opt` and `shm_size` keys if you do not use Playwright. The
production image has none of them.

### Useful variations

| Need                                   | What to change in `.env`                                                                 |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| Port 27017 or 3002 already taken       | `MONGO_PORT=27018`, `NODE_PORT=3003` (and `NODE_HOST` to match)                          |
| Remote MongoDB (Atlas, another server) | Comment out `COMPOSE_FILE`, set `MONGO_HOST` and `MONGO_TYPE=mongodb+srv`                |
| Reach the dev server from another host | `BIND_ADDRESS=0.0.0.0`                                                                   |
| Join an existing Docker network        | Append `:docker-compose.network.yml` to `COMPOSE_FILE` and set `SHARED_NETWORK=<name>`   |
| Send real emails                       | Uncomment and fill the `MAILER_*` variables                                              |

## Without Docker

Requirements: Node.js 26 (`.nvmrc` is provided) and a MongoDB server you can reach.

```bash
git clone https://github.com/e-xode/vue-ssr.git
cd vue-ssr
npm install
cp .env.example .env
```

Edit `.env`:

- Comment out `COMPOSE_FILE` (it only matters to Docker Compose).
- Point `MONGO_HOST` at your server (`localhost` or `localhost:27017`).
- For a local MongoDB **without authentication**, leave `MONGO_USER` and `MONGO_PWD` empty.
- For a MongoDB **with authentication**, the user must be defined in the `MONGO_DB` database
  itself: the connection string is `mongodb://user:password@host/app`, so MongoDB authenticates
  against `app`, not against `admin`. A root user created with `MONGO_INITDB_ROOT_USERNAME` lives
  in `admin` and will be refused. Create the application user once:

  ```bash
  mongosh "mongodb://localhost/app" --eval \
    'db.createUser({ user: "user", pwd: "password", roles: [{ role: "readWrite", db: "app" }] })'
  ```

Then:

```bash
npm run dev
npm run seed:admin -- you@example.com
```

## Next steps

- [Developer guide](./DEVELOPER_GUIDE.md): add a page, an API route, a translation.
- [Deployment](./DEPLOYMENT.md): what production requires.
- [Troubleshooting](./TROUBLESHOOTING.md): when something does not start.
