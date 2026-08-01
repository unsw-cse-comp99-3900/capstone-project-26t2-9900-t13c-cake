#!/bin/sh
set -eu

echo "[entrypoint] Applying migrations..."
npx prisma migrate deploy

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "[entrypoint] Seeding database..."
  npx prisma db seed
fi

echo "[entrypoint] Starting Next.js..."
exec node server.js
