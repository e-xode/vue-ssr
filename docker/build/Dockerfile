FROM node:22-alpine3.19 AS builder

ARG NODE_HOST=https://www.mywebsite.com
ARG NODE_PORT=3006

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

FROM node:22-slim AS runner

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

COPY --from=builder /app/dist/ /app/dist/
COPY  ./server.js /app/server.js
COPY  ./src/ /app/src/
COPY  ./package.json /app/package.json
COPY ./docker/build/config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN npm install -g npm@latest
RUN npm install --production=true

EXPOSE $NODE_PORT

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
