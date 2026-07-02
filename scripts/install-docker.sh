#!/usr/bin/env bash
# Idempotent Docker + Compose install for Ubuntu VPS.
set -euo pipefail

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  echo "Docker already installed: $(docker --version)"
  exit 0
fi

echo "==> Installing Docker..."
# get.docker.com is Docker's own official convenience script and already
# resolves the right package build per detected distro/arch — pinning an
# exact Docker Engine version here would be brittle across Ubuntu releases,
# so we only pin the release channel explicitly (avoids ever silently
# tracking "test"/"nightly" if upstream's default channel choice changes).
curl -fsSL https://get.docker.com | CHANNEL=stable sh
systemctl enable docker
systemctl start docker

echo "Docker installed: $(docker --version)"
docker compose version
