#!/usr/bin/env bash
# Bootstrap the HomePortal CLI. No manual git needed: this fetches the repo and
# launches the interactive CLI for you.
#
# Usage:
#   Ubuntu:  curl -fsSL https://raw.githubusercontent.com/voidmute/HomePortal/main/scripts/bootstrap-cli.sh | sudo bash
#   macOS:   curl -fsSL https://raw.githubusercontent.com/voidmute/HomePortal/main/scripts/bootstrap-cli.sh | bash
#
# The repository is public, so no credentials are needed.
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/voidmute/HomePortal.git}"

clone_failed_help() {
  cat <<'EOF'

Clone failed. Check your network connection and that git is installed,
then re-run this bootstrap command.
EOF
}

# ---------------------------------------------------------------- Ubuntu / Linux
bootstrap_linux() {
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
    echo "This bootstrap supports Ubuntu on Linux (detected: ${ID:-unknown})" >&2
    exit 1
  fi

  local REPO="${REPO_DIR:-/root/homelab}"

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
}

# ---------------------------------------------------------------- macOS
bootstrap_macos() {
  local REPO="${REPO_DIR:-$HOME/homelab}"

  echo "========================================"
  echo "  HomePortal - CLI Bootstrap (macOS)"
  echo "========================================"

  if ! command -v brew >/dev/null 2>&1; then
    echo "Homebrew is required. Install it from https://brew.sh then re-run." >&2
    exit 1
  fi
  command -v git >/dev/null 2>&1 || brew install git
  if ! command -v node >/dev/null 2>&1 || [ "$(node -p "process.versions.node.split('.')[0]")" -lt 20 ]; then
    echo "==> Installing Node.js 20..."
    brew install node@20 || brew install node
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
  echo "==> Installing CLI dependencies..."
  npm --prefix "$REPO/cli" install

  echo "==> Launching HomePortal CLI..."
  exec npm --prefix "$REPO/cli" start
}

case "$(uname -s)" in
  Linux) bootstrap_linux ;;
  Darwin) bootstrap_macos ;;
  *)
    echo "Unsupported OS: $(uname -s). Use Ubuntu, macOS, or the Windows PowerShell one-liner." >&2
    exit 1
    ;;
esac
