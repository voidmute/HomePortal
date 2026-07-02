#!/usr/bin/env bash
# Template installed to /usr/local/bin/homelab by install-homelab.sh.
set -euo pipefail

HOMELAB_REPO_DIR="__HOMELAB_REPO_DIR__"

if [ "$(id -u)" -ne 0 ]; then
  echo ""
  echo "HomePortal setup needs root access for Docker, firewall, systemd, and tunnel setup."
  echo "Run: sudo homelab"
  echo ""
  exit 1
fi

if [ ! -d "$HOMELAB_REPO_DIR/.git" ]; then
  echo "HomePortal repository not found at: $HOMELAB_REPO_DIR" >&2
  echo "Reinstall the command from your cloned repo:" >&2
  echo "  cd /root/homelab && sudo bash install-homelab.sh" >&2
  exit 1
fi

cd "$HOMELAB_REPO_DIR"

if [ -f /etc/os-release ]; then
  # shellcheck source=/dev/null
  source /etc/os-release
  if [ "${ID:-}" != "ubuntu" ]; then
    echo "This CLI supports Ubuntu only (detected: ${ID:-unknown})." >&2
    exit 1
  fi
fi

export DEBIAN_FRONTEND=noninteractive
if ! command -v node >/dev/null 2>&1 || [ "$(node -p "process.versions.node.split('.')[0]")" -lt 20 ]; then
  echo "==> Installing Node.js 20..."
  apt-get update -y
  apt-get install -y curl ca-certificates
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

find scripts -name '*.sh' -exec sed -i 's/\r$//' {} \; -exec chmod +x {} \; 2>/dev/null || true
sed -i 's/\r$//' docker-entrypoint.sh 2>/dev/null || true

if [ ! -d cli/node_modules ]; then
  echo "==> Installing CLI dependencies..."
  npm ci --prefix cli
fi

exec npm run start --prefix cli
