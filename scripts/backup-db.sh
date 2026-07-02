#!/bin/bash
set -euo pipefail

BACKUP_DIR="${BACKUP_ROOT:-/data/backups}/db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="homelab_db_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

PGPASSWORD="${POSTGRES_PASSWORD:-homelab_secret}" pg_dump \
  -h "${POSTGRES_HOST:-postgres}" \
  -U "${POSTGRES_USER:-homelab}" \
  -d "${POSTGRES_DB:-homelab}" \
  | gzip > "${BACKUP_DIR}/${FILENAME}"

echo "Резервная копия БД создана: ${BACKUP_DIR}/${FILENAME}"
