#!/bin/sh
set -e

uid=$(stat -c %u /app)
gid=$(stat -c %g /app)

if [ "$uid" = 0 ]; then
    exec "$@"
fi

if [ "$(id -u node)" != "$uid" ] || [ "$(id -g node)" != "$gid" ]; then
    groupmod -o -g "$gid" node
    usermod -o -u "$uid" -g "$gid" node
    chown -R node:node /home/node
fi

export HOME=/home/node
exec setpriv --reuid="$uid" --regid="$gid" --init-groups "$@"
