#!/bin/bash
set -euo pipefail

source "$(dirname "$0")/../../logs/logs.sh"
require_jq

payload=$(cat)
tool_name=$(printf '%s' "$payload" | jq -r '.tool_name // .tool // ""' | tr '[:upper:]' '[:lower:]')

hook_log_start "tool=$tool_name"

block() {
  hook_log_end "BLOCK: $1"
  emit_block "$1"
  exit 0
}

case "$tool_name" in
  task)
    prompt=$(printf '%s' "$payload" | jq -r '.tool_input.prompt // ""')
    forbidden_re='(npm[[:space:]]+test|npm[[:space:]]+run[[:space:]]+(test|build|lint|format|validate)|eslint|prettier|vitest)'
    if printf '%s\n' "$prompt" | grep -qiE "$forbidden_re"; then
      match=$(printf '%s\n' "$prompt" | grep -oiE "$forbidden_re" | head -1)
      block "Sub-agent prompt contains a forbidden global validation command (matched: \"$match\"). Validation is centralized in the hooks agent. Never instruct sub-agents to run it — see orchestration rule 1 in CLAUDE.md."
    fi
    ;;

  edit|multiedit|write|create)
    path=$(printf '%s' "$payload" | jq -r '.tool_input.path // .tool_input.file_path // ""')
    case "$path" in
      *.vue|*.js|*.scss|*.css)
        case "$tool_name" in
          edit)
            content=$(printf '%s' "$payload" | jq -r '.tool_input.new_str // ""')
            ;;
          multiedit)
            content=$(printf '%s' "$payload" | jq -r '[.tool_input.edits[]?.new_str] | join("\n")')
            ;;
          write|create)
            content=$(printf '%s' "$payload" | jq -r '.tool_input.file_text // .tool_input.content // ""')
            ;;
        esac

        comment_re='(^|[^:"'\''"/])//[^/]|^[[:space:]]*///|/\*[^!*]|<!--'
        violations=$(printf '%s\n' "$content" | grep -nE "$comment_re" || true)

        if [ -n "$violations" ]; then
          first=$(printf '%s\n' "$violations" | head -3)
          block "The new content for \"$path\" contains code comments (// or /* or <!--). Project rule (CLAUDE.md): no comments in .vue/.js/.scss/.css. Refactor with self-explanatory names.

Offending lines (first 3):
$first"
        fi
        ;;
    esac
    ;;
esac

hook_log_end "pass"
exit 0
