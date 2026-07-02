#!/usr/bin/env bash
# Install cloudflared and register a Cloudflare Zero Trust tunnel via token.
# Usage: TUNNEL_TOKEN=xxx bash install-cloudflared.sh
# Pin a specific version instead of "latest" for reproducible installs; bump
# CLOUDFLARED_VERSION deliberately when you want to upgrade.
set -euo pipefail

if [ -z "${TUNNEL_TOKEN:-}" ]; then
  echo "ERROR: Set TUNNEL_TOKEN (from Cloudflare Zero Trust → Tunnels → Install connector)" >&2
  exit 1
fi

CLOUDFLARED_VERSION="${CLOUDFLARED_VERSION:-2026.6.1}"

ARCH="$(uname -m)"
case "$ARCH" in
  x86_64) DEB=cloudflared-linux-amd64.deb ;;
  aarch64|arm64) DEB=cloudflared-linux-arm64.deb ;;
  *)
    echo "Unsupported architecture: $ARCH" >&2
    exit 1
    ;;
esac

echo "==> Installing cloudflared ${CLOUDFLARED_VERSION}..."
TMP="$(mktemp -d)"
curl -fsSL "https://github.com/cloudflare/cloudflared/releases/download/${CLOUDFLARED_VERSION}/${DEB}" -o "${TMP}/cloudflared.deb"
dpkg -i "${TMP}/cloudflared.deb" || apt-get install -f -y
rm -rf "$TMP"

echo "==> Registering tunnel service..."
cloudflared service uninstall 2>/dev/null || true
cloudflared service install "$TUNNEL_TOKEN"

systemctl enable cloudflared
systemctl restart cloudflared

echo "cloudflared status:"
systemctl is-active cloudflared && echo "active" || systemctl status cloudflared --no-pager
