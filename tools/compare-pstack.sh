#!/usr/bin/env bash
# Run frugal's eval suite against frugal and against pstack, so both are compared on the same cases.
# Each run also includes a no-plugin baseline arm, so you get three comparable numbers per case:
#   baseline (no plugin), frugal, pstack.
# Usage: tools/compare-pstack.sh [extra claude plugin eval args, e.g. --tag multistep --runs 1]
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
work="${PSTACK_DIR:-$HOME/pstack-claude}"
out="$root/compare-results"
mkdir -p "$out"

if [ ! -d "$work/.git" ]; then
  git clone --depth 1 https://github.com/michael-denyer/pstack-claude "$work"
fi

# Same cases for pstack; its router skill is poteto-mode instead of frugal.
rm -rf "$work/plugins/pstack/evals"
cp -r "$root/plugins/frugal/evals" "$work/plugins/pstack/evals"
rm -rf "$work/plugins/pstack/evals/results"
grep -rl "input_match: frugal" "$work/plugins/pstack/evals" | xargs -r sed -i 's/input_match: frugal/input_match: poteto-mode/'

common=(--scaffold --allow-tools Write Edit Bash --no-publish "$@")

echo "== frugal"
claude plugin eval "$root/plugins/frugal" "${common[@]}" --json "$out/frugal.json" || true
echo "== pstack"
claude plugin eval "$work/plugins/pstack" "${common[@]}" --json "$out/pstack.json" || true

echo "Results: $out/frugal.json and $out/pstack.json"
