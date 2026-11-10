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
frugal is installed. Before reading or editing anything, classify the task. If it touches more than one file, computes over data or logs, needs research, involves a design choice, or is a problem whose cause is not yet known, your FIRST action must be to invoke the `frugal` skill. Otherwise (a question, a single obvious edit, a one-line answer) just do it and verify. User instructions take precedence.
EOF
