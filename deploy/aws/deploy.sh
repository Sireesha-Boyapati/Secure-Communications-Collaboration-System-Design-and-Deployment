#!/usr/bin/env bash
# Start StudySafe on EC2 after backend/.env is configured.
# Run from repo root: bash deploy/aws/deploy.sh [EC2_PUBLIC_IP]

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [[ ! -f backend/.env ]]; then
  echo "ERROR: backend/.env missing. Run: cp deploy/aws/env.production.example backend/.env && nano backend/.env"
  exit 1
fi

PUBLIC="${1:-$(curl -sf http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || true)}"

if [[ ! -f deploy/aws/certs/fullchain.pem ]]; then
  if [[ -z "$PUBLIC" ]]; then
    echo "ERROR: Run first: bash deploy/aws/generate-selfsigned-cert.sh YOUR_EC2_IP"
    exit 1
  fi
  bash deploy/aws/generate-selfsigned-cert.sh "$PUBLIC"
fi

echo "==> Building and starting StudySafe (production + HTTPS)..."
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Waiting for health..."
for i in {1..30}; do
  if curl -ksf https://127.0.0.1/health >/dev/null 2>&1; then
    echo "==> OK"
    curl -ks https://127.0.0.1/health
    echo
    if [[ -n "$PUBLIC" ]]; then
      echo "==> Open in browser: https://${PUBLIC}"
      echo "    (Accept the certificate warning — required for encrypted chat)"
    fi
    docker compose -f docker-compose.prod.yml ps
    exit 0
  fi
  sleep 2
done

echo "ERROR: Health check failed. Logs:"
docker compose -f docker-compose.prod.yml logs --tail=50
exit 1
