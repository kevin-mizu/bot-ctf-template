#!/bin/sh

(
  while true; do
  	echo "[$(date +'%T')]> Cleaning chromium processes older than 1 minute...";
    ps -o pid,etime,comm | awk '$3 ~ /chrom/ && $1 != 1 && $2 !~ /^0:/ {print $1}' | xargs -r su-exec guest kill -9;
    
  	echo "[$(date +'%T')]> Cleaning /tmp folders owned by guest older than 1 minute...";
    find /tmp -maxdepth 1 -user guest -mmin +1 -print0 | xargs -r -0 su-exec guest rm -rf

    sleep 180;
  done
) &

exec su-exec guest socat TCP-LISTEN:55555,fork,reuseaddr EXEC:"node /usr/app/bot.js",stderr