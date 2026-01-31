FROM alpine:3.23.3

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /usr/app
COPY ./src/package.json .
RUN apk add --update --no-cache nodejs npm socat chromium-chromedriver su-exec	&& \
	npm install

COPY --chown=root:root --chmod=500 ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY ./src/ .
CMD ["/bin/sh", "/entrypoint.sh"]
