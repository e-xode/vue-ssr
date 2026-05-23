#!/bin/bash

if stat -c '%Y' . >/dev/null 2>&1; then
  __PORTABLE_STAT_GNU=1
else
  __PORTABLE_STAT_GNU=0
fi
export __PORTABLE_STAT_GNU

portable_stat() {
  if [ "${__PORTABLE_STAT_GNU:-0}" = "1" ]; then
    stat -c '%Y %s %n' "$@" 2>/dev/null
  else
    stat -f '%m %z %N' "$@" 2>/dev/null
  fi
}

portable_timestamp() {
  date -Iseconds 2>/dev/null || date "+%Y-%m-%dT%H:%M:%S%z"
}

portable_hash() {
  if command -v shasum >/dev/null 2>&1; then
    shasum
  elif command -v sha1sum >/dev/null 2>&1; then
    sha1sum
  else
    cat
  fi
}

compute_digest() {
  {
    git status --porcelain=v2 -uall --no-renames -z 2>/dev/null
    git diff HEAD 2>/dev/null
    while IFS= read -r -d '' f; do
      portable_stat "$f"
    done < <(git ls-files --others --exclude-standard -z 2>/dev/null)
  } | portable_hash | awk '{print $1}'
}

require_jq() {
  command -v jq >/dev/null 2>&1 && return 0
  hook_log "WARN " "jq not found — hook skipped (install jq to enable shell hooks)"
  exit 0
}

emit_block() {
  local reason="$1"
  if command -v jq >/dev/null 2>&1; then
    jq -nc --arg r "$reason" '{decision:"block", reason:$r}'
  else
    local esc=${reason//\\/\\\\}
    esc=${esc//\"/\\\"}
    esc=${esc//$'\n'/\\n}
    esc=${esc//$'\t'/\\t}
    esc=${esc//$'\r'/}
    printf '{"decision":"block","reason":"%s"}\n' "$esc"
  fi
}
