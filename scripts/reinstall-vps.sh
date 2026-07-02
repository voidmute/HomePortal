#!/usr/bin/env bash
# One-time fresh install on VPS — removes old folder, clones from GitHub, rebuilds.
# Keeps Docker volumes (DB, files, backups). Preserves /root/.env.backup if existed.
set -euo pipefail

REPO_SSH="${REPO_SSH:-git@github.com:voidmute/family-home-portal.git}"
TARGET="/root/homelab"

if [[ "$PWD" == "$TARGET"* ]]; then
  echo "ERROR: Do not run from inside $TARGET — cd /root first" >&2
  exit 1
fi

cd /root

echo "==> Backing up .env if present..."
if [ -f "$TARGET/.env" ]; then
  cp "$TARGET/.env" /root/.env.backup
  echo "Saved /root/.env.backup"
fi

echo "==> Stopping old containers (keeping data volumes)..."
if [ -f "$TARGET/docker-compose.yml" ]; then
  (cd "$TARGET" && docker compose down)
fi
docker rm -f jellyfin 2>/dev/null || true

echo "==> Removing old project folder..."
rm -rf "$TARGET"

echo "==> Cloning fresh repo from GitHub..."
git clone "$REPO_SSH" "$TARGET"

echo "==> Restoring .env..."
if [ -f /root/.env.backup ]; then
  cp /root/.env.backup "$TARGET/.env"
else
  cp "$TARGET/.env.example" "$TARGET/.env"
  echo "WARNING: using .env.example — edit $TARGET/.env before production use"
fi

cd "$TARGET"
find scripts -name '*.sh' -exec sed -i 's/\r$//' {} \; -exec chmod +x {} \;
sed -i 's/\r$//' docker-entrypoint.sh 2>/dev/null || true

if [ -f "$TARGET/scripts/generated/kyto-env.sh" ]; then
  # shellcheck source=/dev/null
  source "$TARGET/scripts/generated/kyto-env.sh"
fi

echo "==> Building and starting containers..."
docker compose up -d --build

bash "$TARGET/scripts/wait-health.sh"

echo "==> Applying user roles..."
if declare -F apply_user_roles >/dev/null; then
  apply_user_roles
else
  docker compose exec -T postgres psql -U homelab -d homelab <<'SQL'
UPDATE users SET role = 'USER' WHERE name IN ('bob', 'carol');
UPDATE users SET role = 'ADMIN' WHERE name = 'alice';
SQL
fi

APP_URL="$(grep '^APP_URL=' .env | cut -d= -f2-)"
echo ""
echo "==> Status:"
docker compose ps
echo ""
echo "Done: ${APP_URL}"
