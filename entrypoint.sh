#!/bin/sh

(
  while true; do
  	echo "[$(date +'%T')]> Cleaning chromium processes older than 1 minute...";
    ps -o pid,etime,comm | awk '$3 ~ /chrom/ && $1 != 1 && $2 !~ /^0:/ {print $1}' | xargs -r kill -9;
    sleep 60;
  done
) &

socat TCP-LISTEN:55555,fork,reuseaddr EXEC:"node /usr/app/bot.js",stderr;