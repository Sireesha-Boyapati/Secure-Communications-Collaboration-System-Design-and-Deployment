# StudySafe

[![CI](https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/actions/workflows/ci.yml/badge.svg)](https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/actions)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-EC2-FF9900?logo=amazonaws&logoColor=white)

Secure, end-to-end encrypted realtime messaging platform for confidential team collaboration.

Messages are encrypted in the browser before transmission. The server stores and relays ciphertext only; private keys never leave the client device.

**Live demo:** https://16.16.138.41  
**API documentation:** https://16.16.138.41/docs  
**Team workspace:** [DBS SharePoint](https://mydbs-my.sharepoint.com/shared?ga=1&id=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments%2Fca%20project%20security&listurl=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments)

Development team: Mahendra, Sireesha, Oree, Sudheer

> Production uses HTTPS with a self-signed certificate. Accept the browser security warning once to enable the Web Crypto API.

---

## Overview

StudySafe is a full-stack secure messaging application designed for teams that require real-time communication without delegating confidentiality to the server.

Conventional messaging platforms persist messages on third-party infrastructure, often in plaintext. StudySafe applies client-side cryptography so that confidentiality is enforced by design. Users authenticate via email OTP, join invite-only rooms, and exchange messages in real time with end-to-end encryption comparable to consumer messaging applications.

**Design principle:** plaintext must never reach the backend or database.

---

## Features

### Identity and access control

- Passwordless email OTP authentication with JWT sessions (HS256, 60-minute TTL)
- Invite-only rooms secured with 6-character access codes
- JWT validation on all protected REST endpoints and WebSocket connections

### Encrypted messaging

- ECDH P-256 key agreement and AES-256-GCM encryption via the Web Crypto API
- Per-room public key registration; private keys retained in browser session storage
- SHA-256 key fingerprints for out-of-band verification

### Realtime collaboration

- JWT-authenticated WebSocket relay with presence and typing indicators
- Automatic reconnection with live connection status in the user interface
- Encrypted message history persisted in MongoDB and decrypted on the client

### Production deployment

- Docker Compose on AWS EC2 with nginx TLS termination
- Gmail SMTP for OTP delivery in production environments
- GitHub Actions continuous integration (pytest, vitest, production build)

---

## System architecture

### Deployment topology

```mermaid
flowchart LR
    subgraph Client["Client"]
        A["React SPA<br/>Web Crypto API"]
    end
    subgraph EC2["AWS EC2"]
        B["nginx"]
        C["FastAPI"]
        B --> C
    end
    subgraph Cloud["Data"]
        D[("MongoDB Atlas<br/>users · rooms · messages")]
    end
    A <-->|HTTPS / WSS| B
    C <-->|TLS| D
```

**Golden rule:** plaintext must never reach the backend or database.

### Component responsibilities

**Client tier**
- React SPA — OTP login, key generation, encrypt/decrypt, WebSocket client
- Web Crypto API — ECDH P-256 key pairs and AES-256-GCM message encryption
- sessionStorage — private keys persisted per room for the browser session

**Application tier**
- nginx — HTTPS termination, reverse proxy, React production build
- FastAPI — JWT validation, public-key registry, ciphertext store and relay (no decryption)

**Data tier**
- MongoDB Atlas — users, rooms, public keys, and encrypted messages (ciphertext only)

### End-to-end message flow

```mermaid
sequenceDiagram
    actor User as User (Browser)
    participant API as FastAPI Relay
    participant DB as MongoDB Atlas
    actor Peer as Peer (Browser)

    User->>API: Request OTP (email)
    API->>User: Deliver OTP (SMTP / dev console)
    User->>API: Verify OTP
    API->>User: Issue JWT

    User->>User: Generate ECDH P-256 key pair
    User->>API: Register public key (JWT + room membership)
    API->>DB: Store public key in room_keys

    User->>User: Derive AES-256-GCM key per recipient
    User->>User: Encrypt message locally
    User->>API: Send ciphertext via WebSocket (JWT)
    API->>DB: Persist ciphertext_payload
    API->>Peer: Relay ciphertext frame
    Peer->>Peer: Decrypt locally with shared secret
```

### Cryptographic workflow

1. **Authentication** — User submits email; server generates a time-limited OTP (6 digits, 10-minute expiry). On verification, server issues a JWT (HS256, 60-minute expiry).
2. **Room access** — User creates or joins a room via a random 6-character invite code. Membership is validated on every API and WebSocket request.
3. **Key establishment** — Browser generates an ECDH P-256 key pair per room session. Public key is registered with the server; private key remains in sessionStorage.
4. **Shared secret derivation** — For each recipient, sender performs ECDH with the recipient's registered public key and derives an AES-256-GCM key.
5. **Message encryption** — Plaintext is encrypted locally. The payload includes per-recipient ciphertext and metadata (sender, timestamp).
6. **Relay and storage** — Server stores and forwards ciphertext without decryption capability. Peers decrypt on receipt using their private keys.

**Out-of-band verification:** users compare SHA-256 key fingerprints via a secondary channel (e.g. Zoom or phone) to detect man-in-the-middle key substitution.

---

## Technology stack

### Frontend

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Web Crypto](https://img.shields.io/badge/Web_Crypto-API-4285F4?logo=googlechrome&logoColor=white)

React-based chat interface with client-side encryption and WebSocket connectivity.

### Backend

![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Motor](https://img.shields.io/badge/Motor-async_MongoDB-47A248?logo=mongodb&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-v2-E92063?logo=pydantic&logoColor=white)

FastAPI REST and WebSocket services with JWT authentication, rate limiting, and ciphertext relay.

### Authentication and realtime

![JWT](https://img.shields.io/badge/JWT-HS256-000000?logo=jsonwebtokens&logoColor=white)
![OTP](https://img.shields.io/badge/Email_OTP-Gmail_SMTP-EA4335?logo=gmail&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-JWT_authenticated-010101?logo=socketdotio&logoColor=white)

Passwordless authentication, short-lived sessions, and encrypted realtime messaging.

### Data and infrastructure

![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_M0-47A248?logo=mongodb&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-EC2_t2.micro-FF9900?logo=amazonaws&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![nginx](https://img.shields.io/badge/nginx-TLS-009639?logo=nginx&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)

MongoDB Atlas for encrypted storage; AWS EC2 for production hosting; GitHub Actions for CI.

Further detail: [docs/TECH-STACK.md](docs/TECH-STACK.md)

---

## Security

StudySafe is designed under the assumption that the application server and database may be compromised. The security objective is damage limitation: a breached relay must not expose readable message content.

### Implemented controls

- TLS encryption on all HTTP and WebSocket traffic
- Time-limited OTP codes and short-lived JWT tokens
- Room membership validation on REST and WebSocket requests
- End-to-end AES-256-GCM encryption with client-only private keys
- Pydantic schema validation on all API request bodies
- Rate limiting (60 requests per minute) and 64 KB WebSocket payload limits
- HTTP security headers and honeypot decoy endpoints at `/api/admin/*`
- Secrets managed via environment variables; excluded from version control

### Residual protection after server compromise

An attacker with full access to EC2 and MongoDB cannot:

- Read message plaintext (not stored server-side)
- Derive private keys (never transmitted to the server)
- Decrypt historical messages without each user's browser session keys
- Access a room without a valid JWT for an authorized member

Further detail: [docs/SECURITY-PLAN.md](docs/SECURITY-PLAN.md)

---

## Local development

**Prerequisites:** Python 3.12+, Node.js 20+, MongoDB (local instance or Atlas URI)

```bash
# Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

- Application: http://localhost:5173
- API documentation: http://localhost:8000/docs

Without SMTP configuration, OTP codes are logged to the backend console: `[DEV OTP] email=... code=...`

For multi-user testing, open two browsers with different email accounts and join the same room using the invite code.

---

## AWS production deployment

The production environment runs on a single EC2 instance (Docker Compose: nginx, FastAPI, React). MongoDB Atlas is hosted separately.

```bash
git clone https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment.git
cd Secure-Communications-Collaboration-System-Design-and-Deployment
bash deploy/aws/setup-ec2.sh

cp deploy/aws/env.production.example backend/.env
bash deploy/aws/generate-selfsigned-cert.sh YOUR_EC2_IP
bash deploy/aws/deploy.sh YOUR_EC2_IP
```

Configure `MONGODB_URI`, `JWT_SECRET`, `SMTP_*`, and `CORS_ORIGINS=https://YOUR_EC2_IP` in `backend/.env`.

Open https://YOUR_EC2_IP. Security group: ports 22 (SSH) and 443 (HTTPS).

Deployment guide: [deploy/aws/DEPLOY-AWS.md](deploy/aws/DEPLOY-AWS.md)

---

## Testing

```bash
cd backend && pytest -v
cd frontend && npm test && npm run build
```

Continuous integration runs on every push to the `main` branch.

### Encryption verification

1. Confirm padlock indicators on messages and review key fingerprints in the Encryption panel.
2. Conduct a live chat session between two distinct user accounts in separate browsers.
3. Inspect the MongoDB `messages` collection; `ciphertext_payload` must contain unreadable JSON.
4. Review WebSocket frames in browser DevTools; payloads must not contain plaintext.
5. Confirm the OpenAPI documentation exposes no message decryption endpoints.

---

## Documentation

- [Project overview](docs/STUDYSAFE.md)
- [Technology stack](docs/TECH-STACK.md)
- [Security plan](docs/SECURITY-PLAN.md)
- [Repository security](docs/REPO-SECURITY.md)
- [Deployment options](docs/DEPLOYMENT-OPTIONS.md)
- [AWS deployment guide](deploy/aws/DEPLOY-AWS.md)
- [Attribution](ATTRIBUTION.md)

---

## License

StudySafe secure communications platform. Not licensed for commercial use.
