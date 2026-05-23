#!/bin/bash

export _HOOK_NAME="format"
source "$(dirname "$0")/../../logs/logs.sh"
hook_log_start ""

cat > /dev/null

source "$(dirname "$0")/../../guards/changes/changes.sh"

output=$(npx prettier --write . 2>&1)
status=$?
if [ $status -ne 0 ]; then
  error_summary=$(printf '%s\n' "$output" | tail -30)
  hook_log "ERROR" "$error_summary"
  hook_log_end "BLOCK (format failed)"
  emit_block "Format failed:
$output"
  exit 0
else
  if [ -n "${__GUARD_SENTINEL:-}" ]; then
    digest_after=$(compute_digest)
    printf '%s' "$digest_after" > "$__GUARD_SENTINEL"
  fi
  hook_log_end "pass"
fi
