#!/bin/bash

export _HOOK_NAME="lint"
source "$(dirname "$0")/../../logs/logs.sh"
hook_log_start ""

cat > /dev/null

source "$(dirname "$0")/../../guards/changes/changes.sh"

output=$(npm run lint 2>&1)
if [ $? -ne 0 ]; then
  error_summary=$(printf '%s\n' "$output" | tail -30)
  hook_log "ERROR" "$error_summary"
  hook_log_end "BLOCK (lint failed)"
  jq -nc --arg r "Lint failed:\n$output" '{decision:"block", reason:$r}'
  exit 0
else
  [ -n "${__GUARD_SENTINEL:-}" ] && printf '%s' "$__GUARD_DIGEST" > "$__GUARD_SENTINEL"
  hook_log_end "pass"
fi
