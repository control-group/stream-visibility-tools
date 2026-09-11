#!/bin/sh
# Sync the local module into the Foundry server's modules folder, overwriting
# whatever is currently deployed there.
#
# Usage: ./deploy.sh
# Override the target with env vars, e.g.:
#   REMOTE_HOST=foundrybox.local REMOTE_PATH=/opt/foundryvtt/foundrydata-matt/Data/modules ./deploy.sh

set -eu

REMOTE_HOST="${REMOTE_HOST:-foundrybox.local}"
REMOTE_USER="${REMOTE_USER:-root}"
REMOTE_PATH="${REMOTE_PATH:-/opt/foundryvtt/foundrydata-matt/Data/modules}"
MODULE_NAME="stream-visibility-tools"

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

rsync -avz --delete \
  --exclude='.git' \
  --exclude='deploy.sh' \
  --exclude='watch-deploy.sh' \
  "$SCRIPT_DIR/" \
  "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/${MODULE_NAME}/"

echo "Deployed to ${REMOTE_HOST}:${REMOTE_PATH}/${MODULE_NAME}/"
