#!/usr/bin/env bash
# One-command setup for a blank Ubuntu VPS.
# Prerequisites: root, GitHub deploy key for private repo (see docs/QUICKSTART-RU.md)
#
# Usage:
#   git clone git@github.com:voidmute/family-home-portal.git /root/homelab
#   cd /root/homelab && sudo bash scripts/setup-ubuntu.sh
#
# Non-interactive:
#   APP_DOMAIN=portal.example.com TUNNEL_TOKEN=eyJ... sudo -E bash scripts/setup-ubuntu.sh
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root: sudo bash scripts/setup-ubuntu.sh" >&2
  exit 1
fi

cd /root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="${REPO_DIR:-/root/homelab}"
REPO_SSH="${REPO_SSH:-git@github.com:voidmute/family-home-portal.git}"

echo "========================================"
echo "  Family Home Portal — Ubuntu Setup"
echo "========================================"

echo "==> System packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y git curl ca-certificates openssl ufw unzip

echo "==> Firewall (SSH only; app on localhost:3000)..."
ufw allow OpenSSH
ufw --force enable

bash "$SCRIPT_DIR/install-docker.sh"

if [ ! -d "$REPO/.git" ]; then
  echo "==> Cloning repository..."
  git clone "$REPO_SSH" "$REPO"
else
  echo "==> Repository already at $REPO"
fi

cd "$REPO"
find scripts -name '*.sh' -exec sed -i 's/\r$//' {} \; -exec chmod +x {} \;
sed -i 's/\r$//' docker-entrypoint.sh 2>/dev/null || true

if [ -f "$REPO/scripts/generated/kyto-env.sh" ]; then
  # shellcheck source=/dev/null
  source "$REPO/scripts/generated/kyto-env.sh"
fi

if [ ! -f "$REPO/.env" ]; then
  if [ -n "${APP_DOMAIN:-}" ]; then
    APP_DOMAIN="$APP_DOMAIN" SESSION_SECRET="${SESSION_SECRET:-}" REPO_DIR="$REPO" \
      bash "$SCRIPT_DIR/write-kyto-local.sh"
  elif [ -f "$REPO/.kyto.config" ]; then
    export REPO
    if KURA_BIN="$("$SCRIPT_DIR/kura-resolve.sh")"; then
      (cd "$REPO" && "$KURA_BIN" compile)
    else
      bash "$SCRIPT_DIR/configure-env.sh" "$REPO"
    fi
  else
    bash "$SCRIPT_DIR/configure-env.sh" "$REPO"
  fi
fi

echo "==> Starting Docker stack..."
docker compose up -d --build

bash "$SCRIPT_DIR/wait-health.sh"

echo "==> Applying user roles..."
if declare -F apply_user_roles >/dev/null; then
  apply_user_roles
else
  docker compose exec -T postgres psql -U homelab -d homelab <<'SQL'
UPDATE users SET role = 'USER' WHERE name IN ('bob', 'carol');
UPDATE users SET role = 'ADMIN' WHERE name = 'alice';
SQL
fi

if [ -n "${TUNNEL_TOKEN:-}" ]; then
  bash "$SCRIPT_DIR/install-cloudflared.sh"
elif [ "${SETUP_NONINTERACTIVE:-}" = "1" ]; then
  echo "Tunnel skipped (SETUP_NONINTERACTIVE, no TUNNEL_TOKEN)."
else
  echo ""
  read -r -p "Cloudflare tunnel token (Zero Trust → Tunnels → Install connector), or Enter to skip: " TUNNEL_TOKEN_INPUT || true
  if [ -n "${TUNNEL_TOKEN_INPUT:-}" ]; then
    TUNNEL_TOKEN="$TUNNEL_TOKEN_INPUT" bash "$SCRIPT_DIR/install-cloudflared.sh"
  else
    echo "Skipped cloudflared. Run later: TUNNEL_TOKEN=... bash scripts/install-cloudflared.sh"
  fi
fi
echo ""
echo "========================================"
echo "  Setup complete!"
echo "  Portal: ${APP_URL:-https://your-domain}"
echo "  Local:  http://127.0.0.1:3000 (via tunnel only)"
echo "========================================"
echo "Log in with your Kyto-configured users — scan TOTP QR on first visit."
