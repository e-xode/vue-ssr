#!/bin/bash

source "$(dirname "${BASH_SOURCE[0]}")/../../logs/logs.sh"

cd "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || exit 0

if git diff --quiet HEAD 2>/dev/null \
   && git diff --quiet --cached HEAD 2>/dev/null \
   && [ -z "$(git ls-files --others --exclude-standard 2>/dev/null)" ]; then
  hook_log "SKIP " "no changes detected"
  exit 0
fi

__GUARD_HOOK_NAME="${1:-$(basename "$0" .sh)}"
__GUARD_SENTINEL_DIR="$(git rev-parse --git-dir 2>/dev/null)/copilot-hooks-state"
__GUARD_SENTINEL="$__GUARD_SENTINEL_DIR/$__GUARD_HOOK_NAME"
__GUARD_DIGEST=$(
  {
    git status --porcelain=v2 -uall --no-renames -z 2>/dev/null
    git diff HEAD 2>/dev/null
    git ls-files --others --exclude-standard -z 2>/dev/null \
      | xargs -0 -I{} stat -f '%m %z %N' '{}' 2>/dev/null
  } | shasum | awk '{print $1}'
)

if [ -f "$__GUARD_SENTINEL" ] && [ "$(cat "$__GUARD_SENTINEL" 2>/dev/null)" = "$__GUARD_DIGEST" ]; then
  hook_log "SKIP " "digest unchanged (sentinel match)"
  exit 0
fi

mkdir -p "$__GUARD_SENTINEL_DIR" 2>/dev/null
export __GUARD_SENTINEL __GUARD_DIGEST
