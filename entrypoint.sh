#!/bin/sh

(
  while true; do
  	echo "[$(date +'%T')]> Cleaning chromium processes older than 1 minute...";
    ps -o pid,etime,comm | awk '$3 ~ /chrom/ && $1 != 1 && $2 !~ /^0:/ {print $1}' | xargs -r kill -9;
    
  	echo "[$(date +'%T')]> Cleaning /tmp folders owned by bot older than 1 minute...";
    find /tmp -maxdepth 1 -user bot -mmin +1 -print0 | xargs -r -0 su-exec bot rm -rf

    sleep 60;
  done
) &

exec su-exec bot socat TCP-LISTEN:55555,fork,reuseaddr EXEC:"node /usr/app/bot.js",stderr