#!/bin/bash
set -euo pipefail

BACKUP_DIR="${BACKUP_ROOT:-/data/backups}/cloud"
CLOUD_DIR="${PRIVATE_CLOUD_ROOT:-/data/cloud}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="homelab_cloud_${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUP_DIR"

tar -czf "${BACKUP_DIR}/${FILENAME}" -C "$(dirname "$CLOUD_DIR")" "$(basename "$CLOUD_DIR")"

echo "Резервная копия облака создана: ${BACKUP_DIR}/${FILENAME}"
