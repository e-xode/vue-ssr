FROM node:26-alpine AS builder

ARG NODE_HOST=https://www.mywebsite.com
ARG NODE_PORT=3002

ENV NODE_ENV=production
ENV NODE_PORT=$NODE_PORT
ENV NODE_HOST=$NODE_HOST
ENV PATH=/home/node/.npm-global/bin:$PATH
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

RUN mkdir -p /app
ADD . /app

WORKDIR /app

RUN mkdir /home/node/.npm-global
RUN npm install -g npm@12.0.2
# 🚨 `npm ci` et non `npm install` : l'image doit installer EXACTEMENT l'arbre décrit par
# package-lock.json. Avec `npm install`, la résolution se refaisait dans les plages semver et se
# figeait au gré du cache de couches Docker — donc le lockfile qu'auditent Dependabot et la CI
# n'était pas ce qui partait en production. Constaté sur la flotte le 2026-08-09 : deux applis du
# même socle, même lockfile, embarquaient des versions différentes (l'une déjà corrigée, l'autre
# vulnérable) selon la date de build. `npm ci` échoue aussi si lockfile et package.json divergent,
# au lieu de diverger en silence. `--include=dev` est requis : NODE_ENV=production ci-dessus ferait
# sinon sauter les devDependencies dont `npm run build` a besoin. Voir e-xode/scripts#9.
RUN npm ci --include=dev
RUN npm run build

# ----------------------------------------

FROM node:26-slim AS runner

ARG NODE_HOST=https://www.mywebsite.com
ARG NODE_PORT=3002

ENV NODE_ENV=production
ENV NODE_PORT=$NODE_PORT
ENV NODE_HOST=$NODE_HOST
ENV PATH=/home/node/.npm-global/bin:$PATH
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

RUN apt-get update && apt-get install -y --no-install-recommends \
    supervisor \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Only copy what's needed for production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/src/shared ./src/shared
COPY --from=builder /app/src/api ./src/api
COPY --from=builder /app/src/translate ./src/translate
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY ./docker/build/config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN npm prune --production

EXPOSE $NODE_PORT

# Run as the built-in non-root `node` user (UID/GID 1000). Own /app (app code + node_modules) and
# /home/node so the process can read/execute everything it needs. Runtime writes go to the
# bind-mounted /app/logs + /app/public, which must be 1000:1000 on the host.
RUN chown -R node:node /app /home/node
USER node

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
