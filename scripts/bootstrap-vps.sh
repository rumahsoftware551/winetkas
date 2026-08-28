#!/usr/bin/env sh
set -eu

run_privileged() {
  if [ "$(id -u)" = "0" ]; then
    "$@"
  else
    sudo -n "$@"
  fi
}

if ! command -v git >/dev/null 2>&1 || ! command -v openssl >/dev/null 2>&1; then
  run_privileged apt-get update
  run_privileged apt-get install -y git openssl ca-certificates curl
fi

if ! command -v docker >/dev/null 2>&1; then
  run_privileged apt-get update
  run_privileged apt-get install -y docker.io docker-compose-v2 git openssl ca-certificates curl || \
    run_privileged apt-get install -y docker.io docker-compose-plugin git openssl ca-certificates curl
  run_privileged systemctl enable --now docker
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 tidak tersedia pada VPS."
  exit 1
fi

if [ "$(id -u)" != "0" ] && ! docker info >/dev/null 2>&1; then
  run_privileged usermod -aG docker "$USER"
  echo "User telah ditambahkan ke group docker. Login SSH ulang lalu jalankan workflow kembali."
  exit 1
fi

echo "VPS siap untuk deployment ISPfinance."
