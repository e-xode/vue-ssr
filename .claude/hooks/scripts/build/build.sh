#!/bin/bash

export _HOOK_NAME="build"
source "$(dirname "$0")/../../logs/logs.sh"
hook_log_start ""

cat > /dev/null

source "$(dirname "$0")/../../guards/changes/changes.sh"

output=$(npm run build 2>&1)
if [ $? -ne 0 ]; then
  error_summary=$(printf '%s\n' "$output" | tail -30)
  hook_log "ERROR" "$error_summary"
  hook_log_end "BLOCK (build failed)"
  emit_block "Build failed:
$output"
  exit 0
else
  [ -n "${__GUARD_SENTINEL:-}" ] && printf '%s' "$__GUARD_DIGEST" > "$__GUARD_SENTINEL"
  hook_log_end "pass"
fi
