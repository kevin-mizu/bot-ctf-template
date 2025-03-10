#!/bin/sh
while true; do socat TCP-LISTEN:55555,fork,reuseaddr EXEC:"node /usr/app/bot.js",stderr; done