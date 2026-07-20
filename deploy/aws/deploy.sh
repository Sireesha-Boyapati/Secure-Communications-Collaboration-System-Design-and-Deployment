#!/usr/bin/env bash
# Start StudySafe on EC2 after backend/.env is configured.
# Run from repo root: bash deploy/aws/deploy.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [[ ! -f backend/.env ]]; then
  echo "ERROR: backend/.env missing. Run: cp deploy/aws/env.production.example backend/.env && nano backend/.env"
  exit 1
fi

echo "==> Building and starting StudySafe (production)..."
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Waiting for health..."
for i in {1..30}; do
  if curl -sf http://127.0.0.1/health >/dev/null 2>&1; then
    echo "==> OK"
    curl -s http://127.0.0.1/health
    echo
    PUBLIC=$(curl -sf http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || true)
    if [[ -n "$PUBLIC" ]]; then
      echo "==> Open in browser: http://${PUBLIC}"
    fi
    docker compose -f docker-compose.prod.yml ps
    exit 0
  fi
  sleep 2
done

echo "ERROR: Health check failed. Logs:"
docker compose -f docker-compose.prod.yml logs --tail=50
exit 1
