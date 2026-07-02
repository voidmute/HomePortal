#!/usr/bin/env bash
# Resolve kura binary: PATH, repo bin/, local cache, or auto-download the
# official release from https://github.com/voidmute/kyto (kura is a small
# NASM-assembly compiler — this repo does not vendor its source, only a
# prebuilt Windows binary for local dev convenience at bin/kura-asm.exe).
set -euo pipefail

REPO="${REPO:-${REPO_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}}"
KYTO_REPO="voidmute/kyto"
CACHE_DIR="${KYTO_CACHE_DIR:-$HOME/.cache/kyto}"

if command -v kura >/dev/null 2>&1; then
  echo "kura"
  exit 0
fi

for candidate in \
  "$REPO/bin/kura-asm" \
  "$REPO/bin/kura-asm.exe" \
  "$REPO/../kyto/bin/kura-asm" \
  "$REPO/../kyto/bin/kura-asm.exe" \
  "$CACHE_DIR/kura" \
  "$HOME/.local/bin/kura"
do
  if [ -x "$candidate" ] || [ -f "$candidate" ]; then
    echo "$candidate"
    exit 0
  fi
done

# Not found locally — fetch the latest official Linux release from GitHub.
# Set KYTO_NO_AUTOINSTALL=1 to skip this and fail with install instructions instead.
if [ "${KYTO_NO_AUTOINSTALL:-}" != "1" ] && [ "$(uname -s)" = "Linux" ] && command -v curl >/dev/null 2>&1; then
  echo "kura not found locally — downloading latest release from github.com/$KYTO_REPO..." >&2
  mkdir -p "$CACHE_DIR"
  ASSET_URL="$(curl -fsSL "https://api.github.com/repos/$KYTO_REPO/releases/latest" 2>/dev/null \
    | grep -o '"browser_download_url"[[:space:]]*:[[:space:]]*"[^"]*linux-x86_64\.zip"' \
    | head -n1 \
    | sed -E 's/.*"(https[^"]+)"/\1/')"
  if [ -n "$ASSET_URL" ] && curl -fsSL "$ASSET_URL" -o "$CACHE_DIR/kyto-linux.zip" 2>/dev/null; then
    if command -v unzip >/dev/null 2>&1; then
      unzip -o -j "$CACHE_DIR/kyto-linux.zip" "*/kura" -d "$CACHE_DIR" >/dev/null 2>&1 || true
      [ -f "$CACHE_DIR/kura" ] || unzip -o -j "$CACHE_DIR/kyto-linux.zip" "kura" -d "$CACHE_DIR" >/dev/null 2>&1 || true
    fi
    if [ -f "$CACHE_DIR/kura" ]; then
      chmod +x "$CACHE_DIR/kura"
      echo "$CACHE_DIR/kura"
      exit 0
    fi
  fi
  echo "WARNING: automatic kura download failed, falling back to error below" >&2
fi

echo "ERROR: kura not found. Install it: https://github.com/$KYTO_REPO/wiki/Installing-Kyto" >&2
echo "  Quick install:  curl -fsSL https://raw.githubusercontent.com/$KYTO_REPO/main/scripts/install-kura.sh | bash" >&2
echo "  Or Docker:      docker run --rm -v \"\$PWD:/work\" -w /work ghcr.io/$KYTO_REPO:latest compile" >&2
exit 1
