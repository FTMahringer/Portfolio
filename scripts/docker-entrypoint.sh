#!/bin/sh
set -e

echo "[entrypoint] Initializing database..."
node /app/scripts/init.cjs

echo "[entrypoint] Starting Next.js..."
exec node /app/server.js
