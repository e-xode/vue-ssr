FROM node:22-slim

ENV CHROME_DEVEL_SANDBOX=/usr/local/sbin/chrome-devel-sandbox
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV NODE_ENV=development
ENV NODE_PORT=3002
ENV PATH=/home/node/.npm-global/bin:$PATH

ADD ./run.sh /scripts/run.sh
RUN chmod +x /scripts/*

RUN apt-get update && apt-get install -y --no-install-recommends \
    libnspr4 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libxshmfence1 \
    libglu1-mesa \
    fonts-liberation \
    fonts-noto-color-emoji \
    libfontconfig1 \
    libfreetype6 \
    xdg-utils \
    wget \
    ca-certificates \
    dbus \
    supervisor \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

USER node

WORKDIR /app

RUN mkdir /home/node/.npm-global
RUN npm install -g npm@latest

EXPOSE $NODE_PORT
EXPOSE 24678

CMD ["/bin/sh", "/scripts/run.sh"]