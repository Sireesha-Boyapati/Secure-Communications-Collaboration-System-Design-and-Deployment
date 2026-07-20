#!/usr/bin/env bash
# Bootstrap Ubuntu 22.04 EC2 for StudySafe (free tier).
# Run as ubuntu user after SSH: bash deploy/aws/setup-ec2.sh

set -euo pipefail

echo "==> Installing Docker..."
sudo apt-get update -qq
sudo apt-get install -y -qq ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -qq
sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker "$USER"

echo "==> Docker installed. Log out and back in if 'docker' permission denied."
echo "==> Next steps:"
echo "    1. git clone <your-repo-url> studysafe && cd studysafe"
echo "    2. cp deploy/aws/env.production.example backend/.env && nano backend/.env"
echo "    3. docker compose -f docker-compose.prod.yml up -d --build"
echo "    4. curl http://127.0.0.1/health"
