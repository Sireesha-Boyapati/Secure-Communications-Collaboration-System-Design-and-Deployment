#!/usr/bin/env bash
# Self-signed TLS cert for EC2 demo (Web Crypto requires HTTPS).
# Usage: bash deploy/aws/generate-selfsigned-cert.sh YOUR_EC2_PUBLIC_IP

set -euo pipefail

IP="${1:-}"
if [[ -z "$IP" ]]; then
  IP=$(curl -sf http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || true)
fi
if [[ -z "$IP" ]]; then
  echo "Usage: bash deploy/aws/generate-selfsigned-cert.sh EC2_PUBLIC_IP"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CERT_DIR="$ROOT/deploy/aws/certs"
mkdir -p "$CERT_DIR"

echo "==> Generating self-signed certificate for IP: $IP"
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$CERT_DIR/privkey.pem" \
  -out "$CERT_DIR/fullchain.pem" \
  -subj "/CN=studysafe" \
  -addext "subjectAltName=IP:${IP}"

chmod 600 "$CERT_DIR/privkey.pem"
echo "==> Certs written to deploy/aws/certs/"
echo "==> Use https://${IP} (accept browser security warning once)"
echo "==> Set CORS_ORIGINS=https://${IP} in backend/.env"
