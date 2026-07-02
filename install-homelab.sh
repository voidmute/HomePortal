#!/usr/bin/env bash
# Install the end-user `homelab` command for a cloned HomePortal repository.
#
# End-user flow:
#   git clone git@github.com:voidmute/HomePortal.git /root/homelab
#   cd /root/homelab
#   sudo bash install-homelab.sh
#   sudo homelab
set -euo pipefail

if [ "$(id -u)" -ne 0 ] && [ "${HOMELAB_ALLOW_NON_ROOT:-}" != "1" ]; then
  echo "Run this installer as root:"
  echo "  sudo bash install-homelab.sh"
  exit 1
fi

if [ -f /etc/os-release ]; then
  # shellcheck source=/dev/null
  source /etc/os-release
  if [ "${ID:-}" != "ubuntu" ]; then
    echo "This installer supports Ubuntu only (detected: ${ID:-unknown})." >&2
    exit 1
  fi
else
  echo "Unsupported OS: /etc/os-release not found" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="${HOMELAB_REPO_DIR:-$SCRIPT_DIR}"
BIN_DIR="${HOMELAB_BIN_DIR:-/usr/local/bin}"
LAUNCHER_TEMPLATE="$REPO_DIR/scripts/homelab-launcher.sh"
LAUNCHER_TARGET="$BIN_DIR/homelab"

echo "========================================"
echo "  HomePortal — homelab command install"
echo "========================================"
echo "Repository: $REPO_DIR"
echo "Command:    $LAUNCHER_TARGET"

if [ ! -f "$REPO_DIR/package.json" ] || [ ! -f "$LAUNCHER_TEMPLATE" ]; then
  echo "Run this from the cloned HomePortal repository root." >&2
  exit 1
fi

if [ "${HOMELAB_SKIP_APT:-}" != "1" ]; then
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y git curl ca-certificates

  if ! command -v node >/dev/null 2>&1 || [ "$(node -p "process.versions.node.split('.')[0]")" -lt 20 ]; then
    echo "==> Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
  fi
fi

echo "==> Preparing repository scripts..."
find "$REPO_DIR/scripts" -name '*.sh' -exec sed -i 's/\r$//' {} \; -exec chmod +x {} \; 2>/dev/null || true
sed -i 's/\r$//' "$REPO_DIR/docker-entrypoint.sh" 2>/dev/null || true

if [ "${HOMELAB_SKIP_NPM_CI:-}" != "1" ]; then
  echo "==> Installing CLI dependencies..."
  npm ci --prefix "$REPO_DIR/cli"
fi

echo "==> Installing homelab launcher..."
mkdir -p "$BIN_DIR"
awk -v repo="$REPO_DIR" '{ gsub("__HOMELAB_REPO_DIR__", repo); print }' "$LAUNCHER_TEMPLATE" > "$LAUNCHER_TARGET"
chmod +x "$LAUNCHER_TARGET"

echo ""
echo "Installed. Open the HomePortal CLI from anywhere with:"
echo "  sudo homelab"
