#!/usr/bin/env bash
# Wait until /api/health reports postgres ok (max 120s).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MAX=60
i=0
while [ "$i" -lt "$MAX" ]; do
  if curl -sf http://127.0.0.1:3000/api/health | grep -q '"postgres":"ok"'; then
    echo "Health OK"
    exit 0
  fi
  i=$((i + 1))
  sleep 2
done

echo "Health check timed out — run: docker compose logs -f app" >&2
exit 1
