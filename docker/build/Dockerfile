FROM node:19-alpine3.15 AS builder

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV NODE_PORT=3002
ENV NODE_ENV=production
ENV PATH=/home/node/.npm-global/bin:$PATH

RUN mkdir -p /app
ADD . /app

WORKDIR /app

RUN mkdir /home/node/.npm-global
RUN npm install -g npm@latest
RUN npm install --production=false
RUN npm run build

# ----------------------------------------

FROM node:19-alpine3.15 AS runner

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV NODE_ENV=production
ENV PATH=/home/node/.npm-global/bin:$PATH

ENV MONGO_DB=
ENV MONGO_HOST=
ENV MONGO_PWD=
ENV MONGO_TYPE=
ENV MONGO_USER=
ENV NODE_ENV=production

RUN apk update
RUN apk --no-cache add supervisor

EXPOSE $NODE_PORT

WORKDIR /app/dist

COPY --from=builder /app/dist/ /app/dist/
COPY --from=builder /app/package.json /app/dist/
COPY --from=builder /app/src/server /app/dist/src/server/
COPY ./docker/build/config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN mkdir /home/node/.npm-global
RUN npm install -g npm@latest
RUN npm install


CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
