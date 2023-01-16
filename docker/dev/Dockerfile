FROM node:19-alpine3.15

ENV NODE_ENV=development
ENV PATH=/home/node/.npm-global/bin:$PATH
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

ADD ./run.sh /scripts/run.sh
RUN chmod +x /scripts/*

USER node

WORKDIR /app

RUN mkdir /home/node/.npm-global
RUN npm install -g npm@latest

EXPOSE 3002 24678

CMD ["/bin/sh", "/scripts/run.sh"]
