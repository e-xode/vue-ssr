FROM node:19-alpine3.15 AS builder

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV NODE_ENV=development
ENV PATH=/home/node/.npm-global/bin:$PATH

RUN mkdir -p /app
ADD . /app

WORKDIR /app

RUN mkdir /home/node/.npm-global
RUN npm install -g npm@latest
RUN npm install
RUN npm run build

# ----------------------------------------

FROM node:19-alpine3.15 AS runner

ENV MONGO_DB=
ENV MONGO_HOST=
ENV MONGO_PWD=
ENV MONGO_TYPE=
ENV MONGO_USER=
ENV NODE_ENV=production

RUN apk update
RUN apk --no-cache add supervisor

EXPOSE 3002 24678

WORKDIR /app/dist

COPY --from=builder /app/dist/ /app/dist/
COPY --from=builder /app/node_modules /app/dist/node_modules
COPY --from=builder /app/package.json /app/dist/
COPY --from=builder /app/src/server /app/dist/
COPY ./docker/build/config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
