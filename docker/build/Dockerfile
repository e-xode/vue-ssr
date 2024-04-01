FROM node:21-alpine3.18 AS builder

ENV NODE_ENV=production
ENV NODE_PORT=3002
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

FROM node:21-alpine3.18 AS runner

ENV NODE_ENV=production
ENV PATH=/home/node/.npm-global/bin:$PATH
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

ENV MONGO_DB=
ENV MONGO_HOST=
ENV MONGO_PWD=
ENV MONGO_TYPE=
ENV MONGO_USER=

RUN apk update
RUN apk --no-cache add supervisor

EXPOSE $NODE_PORT

WORKDIR /app/dist

COPY --from=builder /app/dist/client /app/dist/client
COPY --from=builder /app/dist/server/ssr.js /app/dist/server/ssr.js
COPY --from=builder /app/dist/server/assets /app/dist/server/assets
COPY --from=builder /app/package.json /app/dist/
COPY --from=builder /app/src /app/dist/src
COPY ./docker/build/config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN mkdir /home/node/.npm-global
RUN npm install -g npm@latest
RUN npm install

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
