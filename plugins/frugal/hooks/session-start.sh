#!/usr/bin/env bash
# Prints a short pointer to the frugal skill, unless the active config sheet says "session hook: off".
# Project sheet (.frugal/config.md) replaces the user sheet (~/.claude/frugal.md).

config_dir="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
project_dir="${CLAUDE_PROJECT_DIR:-$PWD}"

sheet=""
if [ -f "$project_dir/.frugal/config.md" ]; then
  sheet="$project_dir/.frugal/config.md"
elif [ -f "$config_dir/frugal.md" ]; then
  sheet="$config_dir/frugal.md"
fi

if [ -n "$sheet" ] && grep -Eiq '^[[:space:]]*session hook:[[:space:]]*off' "$sheet"; then
  exit 0
fi

cat <<'EOF'
frugal is installed. For any multi-step task (several files or steps, research, a design choice, a problem with unknown cause), invoke the `frugal` skill first: it sizes the task (L0/L1/L2), loads one playbook, and routes reading to haiku, doing to sonnet, thinking to opus. One-step tasks: just do them and verify. User instructions always take precedence.
EOF
