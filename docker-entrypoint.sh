#!/bin/sh
set -e

run_migration() {
  file="$1"
  echo "Applying ${file}..."
  PGPASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD not set}" psql -v ON_ERROR_STOP=1 -h postgres -U homelab -d homelab -f "$file"
}

echo "Ожидание PostgreSQL..."
until pg_isready -h postgres -U homelab -d homelab 2>/dev/null; do
  sleep 1
done

echo "Применение миграций базы данных..."
run_migration drizzle/migrations/0000_init.sql
if [ -f generated/seed.sql ]; then
  run_migration generated/seed.sql
else
  run_migration drizzle/migrations/0001_seed.sql
  run_migration drizzle/migrations/0002_user_roles.sql
fi
run_migration drizzle/migrations/0003_totp_secret_widen.sql

echo "Запуск приложения..."
exec "$@"
