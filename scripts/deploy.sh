#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/ispfinance}"

cd "$APP_DIR"
test -f .env.production || { echo "File .env.production belum tersedia"; exit 1; }
git fetch origin main
git checkout main
git pull --ff-only origin main
docker compose build --pull
docker compose up -d --remove-orphans
docker compose exec -T app ./node_modules/.bin/prisma migrate deploy
docker compose ps
echo "Deployment ISPfinance selesai."
