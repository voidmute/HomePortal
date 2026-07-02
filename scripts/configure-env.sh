#!/usr/bin/env bash
# Generate /root/homelab/.env from prompts or environment variables.
# Prefer: kura compile (see .kyto.config / kyto.toml). This script is a fallback
# used only when the kura binary can't be resolved (see scripts/kura-resolve.sh).
# Usage: APP_DOMAIN=portal.example.com bash configure-env.sh [/root/homelab]
set -euo pipefail

TARGET="${1:-/root/homelab}"
ENV_FILE="$TARGET/.env"

if [ -f "$ENV_FILE" ] && [ "${FORCE_ENV:-}" != "1" ]; then
  echo ".env already exists at $ENV_FILE (set FORCE_ENV=1 to overwrite)"
  exit 0
fi

DOMAIN="${APP_DOMAIN:-}"
if [ -z "$DOMAIN" ]; then
  if [ "${SETUP_NONINTERACTIVE:-}" = "1" ]; then
    echo "ERROR: APP_DOMAIN is required when SETUP_NONINTERACTIVE=1" >&2
    exit 1
  fi
  read -r -p "Домен портала (например portal.example.com): " DOMAIN
fi

if [ -z "$DOMAIN" ]; then
  echo "ERROR: APP_DOMAIN is required" >&2
  exit 1
fi

SECRET="${SESSION_SECRET:-$(openssl rand -base64 32)}"
PGPASS="${POSTGRES_PASSWORD:-$(openssl rand -base64 24 | tr -d '/+=')}"

cat > "$ENV_FILE" <<EOF
DATABASE_URL=postgresql://homelab:${PGPASS}@postgres:5432/homelab
POSTGRES_PASSWORD=${PGPASS}
REDIS_URL=redis://redis:6379
SESSION_SECRET=${SECRET}
PRIVATE_CLOUD_ROOT=/data/cloud
BACKUP_ROOT=/data/backups
BACKUP_CRON=0 2 * * *
NODE_ENV=production
TRUST_PROXY=true
APP_URL=https://${DOMAIN}
EOF

chmod 600 "$ENV_FILE"
echo "Wrote $ENV_FILE (APP_URL=https://${DOMAIN})"
