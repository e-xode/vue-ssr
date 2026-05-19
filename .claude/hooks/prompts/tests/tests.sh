#!/bin/bash

set -euo pipefail

export _HOOK_NAME="prompt-tests"
source "$(dirname "$0")/../../logs/logs.sh"
hook_log_start ""

input=$(cat)

source "$(dirname "$0")/../../guards/changes/changes.sh"
session_id=$(printf '%s' "$input" | jq -r '.sessionId // empty')

if [ -z "$session_id" ]; then
  hook_log_end "skip (no sessionId)"
  exit 0
fi

marker_dir="$HOME/.copilot/session-state/$session_id"
marker_file="$marker_dir/.hook-update-tests-fired"

if [ -f "$marker_file" ]; then
  hook_log_end "skip (already fired)"
  exit 0
fi

mkdir -p "$marker_dir"
touch "$marker_file"

reason="Check if you need to update or create new unit tests to cover the changes in codebase, and if so, create or update the unit tests accordingly. If there are no updates needed for unit tests, just respond with 'No updates needed for unit tests'."

hook_log_end "BLOCK (prompt injected)"
jq -nc --arg r "$reason" '{decision:"block", reason:$r}'
