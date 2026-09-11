#!/bin/sh
# Watch the module for changes and redeploy automatically via deploy.sh.
# Requires `entr` (dnf install entr) or `fswatch` (dnf install fswatch).

set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$SCRIPT_DIR"

if command -v entr >/dev/null 2>&1; then
  echo "Watching for changes with entr. Ctrl-C to stop."
  find . -path ./.git -prune -o -type f -print | entr -c ./deploy.sh
elif command -v fswatch >/dev/null 2>&1; then
  echo "Watching for changes with fswatch. Ctrl-C to stop."
  ./deploy.sh
  fswatch -o --exclude '\.git' . | while read -r _; do ./deploy.sh; done
else
  echo "Need 'entr' or 'fswatch' installed to watch for changes." >&2
  echo "  sudo dnf install entr" >&2
  echo "  sudo dnf install fswatch" >&2
  exit 1
fi
