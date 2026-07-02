#!/usr/bin/env bash
# Bootstrap the HomePortal CLI on Ubuntu/Linux. No manual git needed: this
# fetches the repo and launches the interactive CLI for you.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/voidmute/HomePortal/main/scripts/bootstrap-cli.sh | sudo bash
#
# The repository is public, so no credentials are needed.
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/voidmute/HomePortal.git}"
REPO="${REPO_DIR:-/root/homelab}"

clone_failed_help() {
  cat <<'EOF'

Clone failed. Check your network connection and that git is installed,
then re-run this bootstrap command.
EOF
}

if [ "$(uname -s)" != "Linux" ]; then
  echo "This bootstrap is for Ubuntu/Linux. On Windows use the PowerShell one-liner:" >&2
  echo "  irm https://raw.githubusercontent.com/voidmute/HomePortal/main/scripts/bootstrap-cli.ps1 | iex" >&2
  exit 1
fi

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root on Linux: curl ... | sudo bash" >&2
  exit 1
fi

if [ ! -f /etc/os-release ]; then
  echo "Unsupported OS: /etc/os-release not found" >&2
  exit 1
fi
# shellcheck source=/dev/null
source /etc/os-release
if [ "${ID:-}" != "ubuntu" ]; then
  echo "This bootstrap supports Ubuntu (detected: ${ID:-unknown})" >&2
  exit 1
fi

echo "========================================"
echo "  HomePortal - CLI Bootstrap (Ubuntu)"
echo "========================================"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y git curl ca-certificates

if ! command -v node >/dev/null 2>&1 || [ "$(node -p "process.versions.node.split('.')[0]")" -lt 20 ]; then
  echo "==> Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Node $(node -v) - npm $(npm -v)"

if [ ! -d "$REPO/.git" ]; then
  echo "==> Cloning repository to $REPO..."
  if ! git clone "$REPO_URL" "$REPO"; then
    clone_failed_help
    exit 1
  fi
else
  echo "==> Repository already at $REPO"
fi

cd "$REPO"
find scripts -name '*.sh' -exec sed -i 's/\r$//' {} \; -exec chmod +x {} \; 2>/dev/null || true

echo "==> Installing homelab command..."
bash "$REPO/install-homelab.sh"

echo "==> Launching setup menu..."
exec homelab
