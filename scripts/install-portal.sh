#!/usr/bin/env bash
# Kyto compile + Ubuntu setup (used by Ink install wizard).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export REPO_DIR="${REPO_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
export APP_DOMAIN="${APP_DOMAIN:?APP_DOMAIN required}"
export SESSION_SECRET="${SESSION_SECRET:-}"
export SETUP_NONINTERACTIVE="${SETUP_NONINTERACTIVE:-1}"

bash "$SCRIPT_DIR/write-kyto-local.sh"
bash "$SCRIPT_DIR/setup-ubuntu.sh"
