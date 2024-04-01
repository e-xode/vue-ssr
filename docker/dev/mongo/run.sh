#!/bin/bash
set -m

mongodb_cmd="mongod --bind_ip 0.0.0.0"
cmd="$mongodb_cmd"

if [ "$MONGODB_AUTH" == "yes" ]; then
    cmd="$cmd --auth"
fi

$cmd &

if [ ! -f /data/db/.mongodb_password_set ]; then
    bash /scripts/auth.sh
fi

fg
