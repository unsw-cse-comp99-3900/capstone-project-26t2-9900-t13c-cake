#!/bin/sh
set -eu

echo "[entrypoint] Applying migrations..."
npx prisma migrate deploy

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "[entrypoint] Seeding database..."
  npx prisma db seed
else
  echo "[entrypoint] Skipping seed (RUN_SEED=${RUN_SEED:-false})"
fi

echo "[entrypoint] Starting Next.js on ${HOSTNAME:-0.0.0.0}:${PORT:-3000}..."
exec node server.js
