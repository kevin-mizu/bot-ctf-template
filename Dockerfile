FROM alpine:3.21.3

WORKDIR /usr/app
COPY ./src/ .
RUN apk add --update --no-cache nodejs npm socat chromium-chromedriver && \
    npm install

COPY ./entrypoint.sh /tmp/entrypoint.sh
CMD ["/bin/sh", "/tmp/entrypoint.sh"]