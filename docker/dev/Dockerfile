FROM node:19-alpine3.15

ADD ./run.sh /scripts/run.sh
RUN chmod +x /scripts/*

USER node

RUN mkdir /home/node/.npm-global
ENV PATH=/home/node/.npm-global/bin:$PATH
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

WORKDIR /app

RUN npm install -g npm@latest

EXPOSE 3000

CMD ["/bin/sh", "/scripts/run.sh"]
