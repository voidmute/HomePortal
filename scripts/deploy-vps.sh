#!/usr/bin/env bash
# Run on VPS after git pull — rebuilds containers without copying node_modules over SSH.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Pulling latest code..."
git pull --ff-only origin main

echo "==> Building and restarting containers..."
docker compose up -d --build --force-recreate

bash "$ROOT/scripts/wait-health.sh"

APP_URL="$(grep '^APP_URL=' .env 2>/dev/null | cut -d= -f2- || echo 'https://your-domain')"
echo ""
echo "Deploy complete: ${APP_URL}"
