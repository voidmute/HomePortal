#!/usr/bin/env bash
# Write/update .kyto.config from the install wizard / CLI, then compile with kura.
# This project runs Kyto in config_only mode (see kyto.toml): .kyto.config is
# the single source of truth, there is no .kyto/*.kyto source layer to write to.
set -euo pipefail

DOMAIN="${APP_DOMAIN:?APP_DOMAIN required}"
SESSION_SECRET="${SESSION_SECRET:-$(openssl rand -base64 32)}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"
REPO="${REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$REPO/.kyto.config"

if [ ! -f "$CONFIG_FILE" ] && [ -f "$REPO/.kyto.config.example" ]; then
  cp "$REPO/.kyto.config.example" "$CONFIG_FILE"
fi

if [ ! -f "$CONFIG_FILE" ]; then
  echo "ERROR: $CONFIG_FILE not found and no .kyto.config.example to copy from" >&2
  exit 1
fi

set_config_key() {
  local key="$1" value="$2"
  if grep -q "^${key} " "$CONFIG_FILE"; then
    sed -i "s|^${key} .*|${key} ${value}|" "$CONFIG_FILE"
  else
    printf '%s %s\n' "$key" "$value" >> "$CONFIG_FILE"
  fi
}

set_config_key "DOMAIN" "$DOMAIN"
set_config_key "SESSION_SECRET" "$SESSION_SECRET"
if [ -n "$POSTGRES_PASSWORD" ]; then
  set_config_key "POSTGRES_PASSWORD" "$POSTGRES_PASSWORD"
fi

chmod 600 "$CONFIG_FILE"

KURA_BIN="$("$SCRIPT_DIR/kura-resolve.sh")"
(cd "$REPO" && "$KURA_BIN" compile)
echo "Kyto config compiled for domain: $DOMAIN"
