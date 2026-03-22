FROM node:24-alpine AS builder

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
RUN npm install -g npm@latest
RUN npm install --production=false
RUN npm run build

# ----------------------------------------

FROM node:24-slim AS runner

ARG NODE_HOST=https://www.mywebsite.com
ARG NODE_PORT=3006

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
COPY --from=builder /app/src/locales ./src/locales
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY ./docker/build/config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN npm prune --production

EXPOSE $NODE_PORT

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
