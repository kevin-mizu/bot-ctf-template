FROM alpine:3.21.3

WORKDIR /usr/app
COPY ./src/package.json .
RUN apk add --update --no-cache nodejs npm socat chromium-chromedriver && \
    npm install

COPY ./src/ .
USER guest
CMD ["socat", "tcp-listen:55555,reuseaddr,fork", "exec:'node /usr/app/bot.js',stderr"]