#!/bin/bash
source "$(dirname "${BASH_SOURCE[0]}")/../lib/portable.sh"

HOOK_LOG="$HOME/.copilot/logs/hooks.log"
_HOOK_NAME="${_HOOK_NAME:-$(basename "${BASH_SOURCE[1]:-$0}" .sh)}"

hook_log() {
  local level="$1" msg="$2"
  mkdir -p "$(dirname "$HOOK_LOG")"
  printf '[%s] [%-5s] %-25s %s\n' "$(portable_timestamp)" "$level" "$_HOOK_NAME" "$msg" >> "$HOOK_LOG"
}

hook_log_start() { hook_log "START" "${1:-}"; }
hook_log_end()   { hook_log "END  " "result=${1:-pass}"; }
