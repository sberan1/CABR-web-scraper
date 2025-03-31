FROM node:lts-alpine

WORKDIR /app

RUN apk update && apk add --no-cache nmap && \
    echo @edge https://dl-cdn.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge https://dl-cdn.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
      chromium \
      harfbuzz \
      "freetype>2.8" \
      ttf-freefont \
      nss \
      libstdc++ \
      libx11 \
      libxcomposite \
      libxdamage \
      libxext \
      libxi \
      libxtst \
      ca-certificates \
      cups-libs \
      dbus \
      eudev \
      ttf-opensans \
      bash

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY . /app

RUN npm install

EXPOSE 3134

CMD ["node", "index.js"]
