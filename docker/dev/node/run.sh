#!/bin/sh
set -e

LOCK_FILE=package-lock.json
LOCK_STAMP=node_modules/.lock-hash

if [ ! -f "$LOCK_FILE" ]; then
    echo "missing $LOCK_FILE: cannot verify dependency freshness" >&2
    exit 1
fi

LOCK_HASH=$(md5sum "$LOCK_FILE" | cut -d' ' -f1)

if [ ! -f "$LOCK_STAMP" ] || [ "$(cat "$LOCK_STAMP")" != "$LOCK_HASH" ]; then
    npm install --production=false
    printf '%s' "$LOCK_HASH" > "$LOCK_STAMP"
else
    echo "dependencies up to date, skipping npm install"
fi

echo "Starting development server..."
exec npm run dev
