# StudySafe

**End-to-end encrypted realtime chat for student project teams.**

Messages are encrypted in the browser before they reach the server. MongoDB and the API store **ciphertext only** — even if the server is compromised, attackers cannot read message content without private keys that never leave users' devices.

[![CI](https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/actions/workflows/ci.yml/badge.svg)](https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/actions)

**Live demo:** https://16.16.138.41 · **API docs:** https://16.16.138.41/docs  
*(HTTPS with self-signed certificate — accept browser warning once)*

**Module:** B9IS103 Computer Systems Security  
**Team:** Mahendra · Sireesha · Oree · Sudheer  
**Team workspace (MoM, recordings):** [DBS SharePoint](https://mydbs-my.sharepoint.com/shared?ga=1&id=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments%2Fca%20project%20security&listurl=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments)

---

## The problem we solve

Student teams coordinate on WhatsApp, Discord, and email every day. Those channels store messages in plaintext on third-party servers, expose metadata (who spoke to whom, when), and offer no guarantee that a compromised relay cannot read content.

**StudySafe** gives teams a dedicated channel where confidentiality is enforced by **cryptography**, not policy. Users authenticate with email OTP, join invite-only rooms, and chat in real time — with the same live feel as mainstream messengers, but with end-to-end encryption built in.

---

## What we built

StudySafe is a full-stack secure messaging platform deployed on **AWS EC2**, backed by **MongoDB Atlas**, with a **React** single-page app and a **FastAPI** ciphertext relay.

**Identity & access**
- Passwordless login — email OTP, then JWT session (no passwords stored)
- Invite-only rooms with 6-character codes
- JWT required on every protected REST call and WebSocket connection

**Encrypted messaging**
- ECDH P-256 key agreement + AES-256-GCM via the browser **Web Crypto API**
- Public keys registered per room; private keys stay in the browser
- SHA-256 key fingerprints for out-of-band verification (Zoom / phone)
- Message history stored as ciphertext; decrypted only when users rejoin

**Realtime collaboration**
- WebSocket relay with JWT authentication
- Live presence and typing indicators (ephemeral — not stored)
- Auto-reconnect with backoff and a **Live** status badge in the UI

**Production operations**
- Docker Compose on EC2 (nginx + FastAPI + React build)
- HTTPS required for Web Crypto (self-signed cert for demo)
- Gmail SMTP for OTP delivery in production
- GitHub Actions CI — pytest, vitest, build on every push
- Structured logging, rate limiting, security headers, honeypot endpoint

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Browser — React 18 + TypeScript + Web Crypto API            │
│  • OTP login → JWT                                           │
│  • ECDH key pair per session (persisted in sessionStorage)   │
│  • Encrypt before send · decrypt after receive               │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTPS / WSS
┌────────────────────────────▼─────────────────────────────────┐
│  AWS EC2 — nginx + FastAPI (Docker)                          │
│  • JWT auth on REST + WebSocket                              │
│  • Public-key registry · ciphertext relay · rate limits        │
│  • Never decrypts messages                                   │
└────────────────────────────┬─────────────────────────────────┘
                             │ TLS
┌────────────────────────────▼─────────────────────────────────┐
│  MongoDB Atlas                                               │
│  users · otp_codes · rooms · room_keys · messages (cipher)   │
└──────────────────────────────────────────────────────────────┘
```

**Golden rule:** Plaintext must **never** reach the backend or database.

**User journey**
1. Enter email → receive OTP → verify → JWT issued  
2. Create or join a room with an invite code  
3. Browser generates ECDH keys; public key registered with the server  
4. Open authenticated WebSocket  
5. Encrypt message locally → server stores and relays ciphertext → peers decrypt locally  

---

## Security design — what if someone attacks the server?

StudySafe assumes the relay and database may be targeted. The design goal is **damage limitation**: an attacker who breaks into EC2 or MongoDB should still not obtain readable messages.

### Controls in place

| Layer | Control |
|-------|---------|
| Transport | HTTPS / WSS (TLS on EC2) |
| Authentication | Time-limited email OTP + JWT (HS256, 60 min) |
| Authorization | Room membership checked on REST and WebSocket |
| Encryption | E2E AES-256-GCM; server has no private keys |
| Input validation | Pydantic schemas on all API bodies |
| Abuse prevention | Rate limits (OTP, API), 64 KB WebSocket payload cap |
| HTTP hardening | Security headers (X-Frame-Options, X-Content-Type-Options, etc.) |
| Reconnaissance | Honeypot `/api/admin/*` logs probing attempts |
| Secrets | `.env` gitignored; JWT and DB URI not in source code |

### Attack scenarios and how we mitigate them

| Attack | What happens | Our mitigation |
|--------|----------------|----------------|
| **Server or DB breach** | Attacker dumps MongoDB | Only **ciphertext** and metadata stored — messages unreadable without private keys in users' browsers |
| **Network MITM** | Attacker swaps public keys | Users verify **SHA-256 fingerprints** on a second channel (Zoom / phone) |
| **Stolen JWT** | Attacker impersonates a user | Short TTL; room membership still enforced; cannot decrypt past messages without keys |
| **OTP brute force** | Rapid login attempts | Rate limiting, OTP expiry, failed attempts capped |
| **WebSocket hijack** | Connect without permission | JWT + room membership check before socket accepted |
| **API flooding / DoS** | Flood OTP or WebSocket | slowapi rate limits; payload size limits |
| **NoSQL / injection** | Malformed API input | Pydantic validation; typed Motor queries |
| **Reconnaissance** | Probe fake admin routes | Honeypot returns decoy data and logs the attempt |
| **Invite code guessing** | Join room without invite | Rate limits; codes are random 6-character alphanumeric |

### What an attacker still cannot do after compromising the server

- Read message **plaintext** (never stored)
- Derive private keys (never sent to server)
- Decrypt historical ciphertext without each user's browser keys
- Bypass room membership without a valid JWT for a member account

### Planned hardening (future)

- HttpOnly secure cookies instead of JWT in localStorage (reduce XSS impact)
- Content Security Policy headers
- Elastic IP + Let's Encrypt for trusted HTTPS certificate
- AWS SES with verified domain (alternative to Gmail SMTP)

Full peer vulnerability analysis: [docs/PEER-SYSTEM-ANALYSIS.md](docs/PEER-SYSTEM-ANALYSIS.md)  
Manual penetration test notes: [docs/PENETRATION-TEST.md](docs/PENETRATION-TEST.md)

---

## How to prove encryption works (lecturer demo)

1. **In the app** — padlock on messages; open **Encryption & keys** to show fingerprints  
2. **Two browsers** — Alice and Bob (must use **two different emails**); show live encrypted chat  
3. **MongoDB Atlas** — open `messages` collection; `ciphertext_payload` is unreadable JSON  
4. **Browser DevTools** — Network → WebSocket → outgoing frames are encrypted, not plain English  
5. **API** — `/docs` describes a ciphertext relay; server never exposes decrypt endpoints  

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Cryptography | Web Crypto API — ECDH P-256, AES-256-GCM, SHA-256 |
| Backend | Python 3.12, FastAPI, Motor (async MongoDB) |
| Auth | Email OTP + JWT (python-jose) |
| Realtime | WebSocket (presence, typing, message relay) |
| Database | MongoDB Atlas M0 |
| Email | Gmail SMTP (production) / console log (local dev) |
| Infrastructure | AWS EC2 t2.micro, Docker Compose, nginx |
| CI | GitHub Actions |

---

## Run locally

**Prerequisites:** Python 3.12+, Node.js 20+, MongoDB (local or Atlas URI)

```bash
# Terminal 1 — backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env          # set MONGODB_URI, JWT_SECRET; optional SMTP for email OTP
uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend && npm install && npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:8000/docs  

Without SMTP, OTP prints in the backend terminal: `[DEV OTP] email=... code=...`

**Two-user test:** open Incognito, sign in with a **different email**, join the same room via invite code.

---

## Production deployment (AWS EC2)

Deployed as a single EC2 instance running Docker — frontend, backend, and nginx together. Database is MongoDB Atlas (not on EC2).

```bash
git clone https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment.git
cd Secure-Communications-Collaboration-System-Design-and-Deployment
bash deploy/aws/setup-ec2.sh

cp deploy/aws/env.production.example backend/.env
# Edit: MONGODB_URI, JWT_SECRET, SMTP_*, CORS_ORIGINS=https://YOUR_EC2_IP

bash deploy/aws/generate-selfsigned-cert.sh YOUR_EC2_IP
bash deploy/aws/deploy.sh YOUR_EC2_IP
```

Open **https://YOUR_EC2_IP**. Security group must allow ports **22** (SSH) and **443** (HTTPS).

Detailed steps: [deploy/aws/DEPLOY-AWS.md](deploy/aws/DEPLOY-AWS.md)

---

## Testing

```bash
cd backend && pytest -v
cd frontend && npm test && npm run build
```

CI runs on every push to `main`.

---

## Project links

| Resource | Link |
|----------|------|
| GitHub repository | [Secure-Communications-Collaboration-System-Design-and-Deployment](https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment) |
| Live application | https://16.16.138.41 |
| Team SharePoint (MoM & recordings) | [Open SharePoint](https://mydbs-my.sharepoint.com/shared?ga=1&id=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments%2Fca%20project%20security&listurl=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments) |
| CA requirement traceability | [docs/REQUIREMENTS-COMPLIANCE.md](docs/REQUIREMENTS-COMPLIANCE.md) |
| Demo script | [docs/DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md) |
| AI attribution | [docs/AI-CHAT-LOGS.md](docs/AI-CHAT-LOGS.md) · [ATTRIBUTION.md](ATTRIBUTION.md) |

---

## License

Academic project — B9IS103 DBS. Not licensed for commercial use.
