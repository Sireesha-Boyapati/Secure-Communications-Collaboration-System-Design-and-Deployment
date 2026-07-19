# StudySafe

> **End-to-end encrypted realtime chat for student teams.**  
> Messages are encrypted in the browser before they reach the server — the relay stores ciphertext only.

[![CI](https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/actions/workflows/ci.yml/badge.svg)](https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/actions)

`React 18` · `TypeScript` · `FastAPI` · `MongoDB` · `WebSocket` · `Web Crypto API` · `Docker` · `GitHub Actions`

---

### Links

| | |
|---|---|
| **Live demo (local)** | http://localhost:5173 |
| **API docs** | http://localhost:8000/docs |
| **Demo walkthrough** | [docs/DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md) |
| **Team meetings (MoM & recordings)** | [DBS SharePoint](https://mydbs-my.sharepoint.com/shared?ga=1&id=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments%2Fca%20project%20security&listurl=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments) |
| **CA requirement traceability** | [docs/REQUIREMENTS-COMPLIANCE.md](docs/REQUIREMENTS-COMPLIANCE.md) |

**Team:** Mahendra · Sireesha · Oree · Sudheer · **Module:** B9IS103 Computer Systems Security

---

## Quick start

```bash
docker compose up mongodb -d
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

Sign in at http://localhost:5173 — OTP appears in the backend terminal as `[DEV OTP] email=... code=...`.

---

## Features

### Encrypted messaging
- **E2E encryption** in the browser (ECDH P-256 + AES-256-GCM)
- Key agreement **without meeting in person** — public keys on server, private keys local
- **Key fingerprint** for out-of-band verification (Zoom / phone)
- **Message history** — ciphertext in MongoDB, decrypted on client rejoin

### Realtime collaboration
- **WebSocket** ciphertext relay with JWT authentication
- **Live presence** — see who is online in each room
- **Typing indicators** — ephemeral, never stored
- **Auto-reconnect** with backoff · **Live** connection badge in UI

### Identity & security
- **Email OTP** login → JWT session (no passwords stored)
- **Invite-only rooms** — 6-character join codes
- Rate limiting, security headers, honeypot endpoint
- OpenAPI docs, pytest + vitest, CI on every push

Details: [docs/REALTIME-ARCHITECTURE.md](docs/REALTIME-ARCHITECTURE.md)

---

## Overview

StudySafe is a self-hosted messaging platform for student project teams. Users authenticate with email OTP, join rooms via invite codes, and chat in real time. The FastAPI backend is a **ciphertext relay** — it never decrypts messages. MongoDB holds encrypted payloads and public keys only.

Full functional, security, and assessment mapping: **[docs/REQUIREMENTS-COMPLIANCE.md](docs/REQUIREMENTS-COMPLIANCE.md)**

---

## 2. Business Problem

Student teams coordinate daily on deadlines, credentials, and assignment splits using WhatsApp, Discord, or email. These channels:

- Store messages on third-party servers in plaintext
- Expose metadata (who talked to whom, when)
- Offer no guarantee that a compromised relay cannot read content
- Mix personal and academic identity without institutional control

**StudySafe** gives teams a dedicated, auditable channel where confidentiality is enforced by cryptography, not policy.

---

## 3. Solution Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENT (Browser)                                               │
│  React + TypeScript + Web Crypto API                            │
│  • Email OTP login → JWT stored in localStorage                 │
│  • ECDH P-256 key pair generated per session                    │
│  • AES-256-GCM encrypt before send                              │
│  • Decrypt on receive — private key never leaves browser        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS / WSS (TLS)
┌───────────────────────────▼─────────────────────────────────────┐
│  BACKEND (FastAPI on AWS EC2 / Docker)                           │
│  • JWT authentication on REST + WebSocket                       │
│  • Public-key registry per room                                 │
│  • WebSocket ciphertext relay                                   │
│  • Rate limiting, security headers, honeypot logging             │
└───────────────────────────┬─────────────────────────────────────┘
                            │ TLS
┌───────────────────────────▼─────────────────────────────────────┐
│  MongoDB Atlas                                                  │
│  users · otp_codes · rooms · room_keys · messages (ciphertext)  │
└─────────────────────────────────────────────────────────────────┘
```

**Golden rule:** Plaintext must **never** reach the backend or database.

---

## 4. Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18, TypeScript, Vite | SPA, routing, UI |
| Crypto | Web Crypto API (native) | ECDH P-256, AES-256-GCM, SHA-256 |
| Backend | Python 3.12, FastAPI | REST + WebSocket API |
| Auth | Email OTP + JWT (python-jose) | Passwordless identity |
| Database | MongoDB 7 (Motor async driver) | Persistence |
| Email | AWS SES (boto3) | OTP delivery in production |
| Container | Docker, docker-compose | Local + deployment parity |
| CI | GitHub Actions | Automated test + build |
| Cloud | AWS EC2, ALB, CloudFront (planned) | Production hosting |

---

## 5. System Design

### User journey

1. Enter email → receive OTP → verify → JWT issued  
2. Create or join a room with an invite code  
3. Browser generates ECDH keys; public key registered with server  
4. Open WebSocket (JWT-authenticated)  
5. Encrypt message client-side → send ciphertext → server stores & relays → peers decrypt locally  

### Realtime pipeline

```
Browser A                    FastAPI relay                 Browser B
   │  typing / presence  ───────►│◄──────────────────  typing / presence
   │  encrypted payload  ───────►│ store ciphertext ──►  decrypt locally
   │  auto-reconnect             │ JWT + room check
```

| Capability | Transport | Stored? |
|------------|-----------|---------|
| Messages | WebSocket `type: message` | MongoDB (ciphertext) |
| Presence | WebSocket `type: presence` | In-memory only |
| Typing | WebSocket `type: typing` | Not stored |
| Online snapshot | REST `GET /rooms/{id}/online` | Optional fallback |

See [docs/REALTIME-ARCHITECTURE.md](docs/REALTIME-ARCHITECTURE.md) for protocol details.

### Backend layers

```
routers/     → HTTP/WebSocket entry points, validation
services/    → Business logic (auth, rooms, messages)
db/repos/    → MongoDB data access
auth/        → JWT issue/verify, FastAPI dependencies
security/    → Rate limits, honeypots, headers
core/        → Logging, exceptions
```

---

## 6. Frontend Architecture

```
frontend/src/
├── api/           # REST client (auth, rooms) with JWT + error handling
├── components/
│   ├── chat/      # ChatRoom — E2E encrypt/decrypt + WebSocket
│   └── layout/    # ProtectedRoute
├── context/       # AuthContext — session state
├── lib/           # crypto.ts (Web Crypto), websocket.ts
├── pages/         # LoginPage, DashboardPage, ChatPage
└── types/         # Shared TypeScript interfaces
```

| Component | Responsibility |
|-----------|----------------|
| `LoginPage` | Email OTP request + verify |
| `DashboardPage` | Create/join rooms, list memberships |
| `ChatPage` | Encrypted real-time chat |
| `api/client.ts` | Centralised fetch, `ApiError`, token management |
| `lib/crypto.ts` | Key generation, ECDH, AES-GCM, fingerprint |

---

## 7. Backend Architecture

```
backend/app/
├── main.py              # App factory, lifespan, WebSocket endpoint
├── config.py            # pydantic-settings from .env
├── core/                # logging, exceptions
├── auth/                # JWT + get_current_user dependency
├── db/
│   ├── client.py        # Motor connection lifecycle
│   └── repositories/    # users, otp, rooms, messages
├── services/            # auth_service, room_service, message_service, email_service
├── routers/             # auth, rooms, messages, health
├── security/            # rate_limit, honeypot, middleware
└── websocket/           # ConnectionManager
```

---

## 8. Database Design

### Collections

| Collection | Purpose | Sensitive data |
|------------|---------|----------------|
| `users` | Email, display name, verified flag | No plaintext messages |
| `otp_codes` | Hashed OTP with TTL (auto-expire index) | Temporary |
| `rooms` | Name, invite code, member IDs | No message content |
| `room_keys` | Public JWK + fingerprint per user per room | Public keys only |
| `messages` | Ciphertext payload JSON | **Ciphertext only** |

### Example `messages` document

```json
{
  "room_id": "ObjectId",
  "from_user_id": "ObjectId",
  "from_username": "Alice",
  "ciphertext_payload": "{\"type\":\"encrypted_message\",\"recipients\":[...]}",
  "created_at": "ISODate"
}
```

---

## 9. API Documentation

Interactive docs: **http://localhost:8000/docs**

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/otp/request` | No | Send OTP to email |
| POST | `/api/auth/otp/verify` | No | Verify OTP → JWT |
| GET | `/api/auth/me` | JWT | Current user profile |

### Rooms

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/rooms` | JWT | Create room |
| POST | `/api/rooms/join` | JWT | Join by invite code |
| GET | `/api/rooms/mine` | JWT | List user's rooms |
| GET | `/api/rooms/{id}` | JWT | Room details |
| POST | `/api/rooms/{id}/keys` | JWT | Register public key |
| GET | `/api/rooms/{id}/keys` | JWT | List room public keys |
| GET | `/api/rooms/{id}/messages` | JWT | Ciphertext history |
| GET | `/api/rooms/{id}/online` | JWT | Connected usernames (REST snapshot) |

### WebSocket

| Endpoint | Auth | Description |
|----------|------|-------------|
| `WS /ws/{room_id}?token=JWT` | JWT query param | Real-time ciphertext relay |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Liveness + DB status |

---

## 10. Security Architecture

| Layer | Control |
|-------|---------|
| Transport | TLS 1.2+ (HTTPS/WSS in production) |
| Authentication | Email OTP (time-limited) + JWT (HS256, 60 min) |
| Authorization | Room membership check on REST + WebSocket |
| Encryption | E2E AES-256-GCM with ECDH P-256 key agreement |
| Input validation | Pydantic schemas on all REST bodies |
| Rate limiting | slowapi — 5 OTP/min, 60 req/min default |
| Headers | X-Content-Type-Options, X-Frame-Options, CSP-ready |
| Secrets | `.env` locally, AWS Secrets Manager in prod |
| Monitoring | Structured logging + honeypot alerts |
| Data | Server stores ciphertext only |

---

## 11. Threat Model

| Asset | Threat | Mitigation |
|-------|--------|------------|
| Message plaintext | Server compromise | E2E encryption — server never has keys |
| Private keys | XSS exfiltration | Keys in memory only; CSP headers (Phase 2) |
| JWT | Theft via XSS | Short expiry; HttpOnly cookies (future) |
| OTP | Brute force | Rate limit + 5 attempts + TTL expiry |
| Public keys | MITM substitution | Fingerprint verification out-of-band |
| API | Unauthorized access | JWT on all protected routes |
| DB | Injection | Motor parameterized queries; Pydantic validation |
| Admin panel | Reconnaissance | Honeypot endpoint logs attackers |

---

## 12. Attack Scenarios

| Vulnerability / Attack | Who Can Attack | How Attack Happens | Impact | Prevention / Remediation |
|------------------------|----------------|--------------------|--------|--------------------------|
| **Man-in-the-middle** | Network attacker | Substitute public key during registration | Decrypt messages | Verify SHA-256 fingerprint on second channel (Zoom/phone) |
| **Server data breach** | External attacker | Compromise EC2 or MongoDB | Ciphertext only exposed — not readable without private keys | E2E encryption; no plaintext at rest |
| **JWT theft** | Malicious script (XSS) | Steal token from localStorage | Impersonate user for session duration | Short JWT TTL; CSP; move to HttpOnly cookies |
| **OTP brute force** | External attacker | Rapid verify attempts | Account takeover | Rate limiting; 5-attempt cap; OTP expiry |
| **WebSocket hijacking** | Authenticated attacker | Connect without room membership | Receive room ciphertext | Membership check before WS accept |
| **NoSQL injection** | External attacker | Malformed JSON in API fields | Data leak or bypass | Pydantic validation; typed Motor queries |
| **DoS / flooding** | External attacker | Flood WebSocket or OTP endpoint | Service unavailable | Rate limiting; payload size cap (64 KB) |
| **Outsider pushes malicious code** | External person | Gains collaborator access or steals credentials | Backdoor in production | Limit collaborators to 4; branch protection; PR reviews — see `docs/REPO-SECURITY.md` |
| **Reconnaissance** | External attacker | Probe `/api/admin/users` | Information gathering attempt | Honeypot logs IP; returns decoy data |
| **Invite code guessing** | External attacker | Brute force 6-char code | Unauthorized room join | Rate limit; lock after failures (future) |
| **Insider (server admin)** | Cloud operator | Read MongoDB directly | See ciphertext + metadata, not plaintext | E2E design; minimal metadata collection |

---

## 13. Remediation Strategies

| Risk | Strategy | Status |
|------|----------|--------|
| Plaintext on server | Client-side encryption before send | Implemented |
| Weak auth | Email OTP + JWT | Implemented |
| No persistence | MongoDB with Motor | Implemented |
| No rate limits | slowapi middleware | Implemented |
| No audit trail | Structured logging + honeypot | Implemented |
| HTTP in production | TLS via ALB + ACM | Planned (AWS) |
| Token in localStorage | Migrate to HttpOnly secure cookie | Future |
| No automated tests | pytest + vitest + GitHub Actions | Implemented |
| Secrets in repo | `.env` gitignored; Secrets Manager | Implemented / Planned |

---

## 14. Deployment Steps

### Docker (recommended)

```bash
cp backend/.env.example backend/.env
# Edit JWT_SECRET in backend/.env

docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/docs

### AWS (production outline)

1. Provision MongoDB Atlas cluster (same region as EC2)
2. Store `JWT_SECRET`, `MONGODB_URI`, SES credentials in **AWS Secrets Manager**
3. Launch EC2 with Docker; pull image from ECR
4. Configure **ALB** with HTTPS (ACM certificate)
5. Point **CloudFront** to ALB for static frontend (or S3 + CloudFront)
6. Configure **SES** verified domain for OTP emails
7. Enable **CloudWatch** log shipping from container

See [deploy/README.md](deploy/README.md) for architecture notes.

---

## 15. Local Setup Instructions

### Prerequisites

- Python 3.12+
- Node.js 20+
- MongoDB 7 (local or `docker compose up mongodb -d`)

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Demo flow

See **[docs/DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md)** for the full step-by-step guide. Summary:

1. Open http://localhost:5173 → sign in with any email
2. Copy OTP from backend terminal: `[DEV OTP] email=... code=...`
3. Create a room → share invite code
4. Second browser (incognito) → second user joins
5. Confirm **Live** badge, typing indicator, and encrypted messages
6. DevTools → Network → verify ciphertext on the wire
7. Open http://localhost:8000/docs for the typed API

---

## 16. Testing Strategy

| Layer | Tool | What is tested |
|-------|------|----------------|
| Backend API | pytest + httpx | Health, auth validation, protected routes |
| Frontend crypto | vitest | Key generation, fingerprint format |
| CI | GitHub Actions | Backend tests with MongoDB service; frontend build + test |
| Manual | Two-browser demo | E2E encrypt/decrypt, WebSocket relay |
| Security | Honeypot endpoint | Logs suspicious `/api/admin/users` access |

```bash
# Backend
cd backend && pytest -v

# Frontend
cd frontend && npm test && npm run build
```

---

## 17. Future Improvements

- [ ] HttpOnly cookie-based JWT (reduce XSS token theft)
- [ ] Content Security Policy headers
- [ ] AWS deployment with Terraform (see `deploy/README.md`)
- [ ] CloudWatch dashboards and alerts
- [ ] Invite code brute-force lockout
- [ ] Encrypted file attachments
- [ ] Progressive Web App for mobile

---

## Documentation

| Document | Purpose |
|----------|---------|
| [Team SharePoint — meetings & recordings](https://mydbs-my.sharepoint.com/shared?ga=1&id=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments%2Fca%20project%20security&listurl=%2Fpersonal%2F20097954%5Fmydbs%5Fie%2FDocuments) | MoM, meeting transcripts, session recordings |
| [docs/meetings/](docs/meetings/) | Local MoM summaries (e.g. idea selection) |
| [docs/DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md) | Live demo walkthrough (local setup → two-user encrypted chat) |
| [docs/REQUIREMENTS-COMPLIANCE.md](docs/REQUIREMENTS-COMPLIANCE.md) | Brief requirements mapped to code |
| [docs/IMPLEMENTATION-MAP.md](docs/IMPLEMENTATION-MAP.md) | README sections and features → source files |
| [docs/PEER-SYSTEM-ANALYSIS.md](docs/PEER-SYSTEM-ANALYSIS.md) | Peer vulnerability analysis + reactive rebuttals |
| [docs/REALTIME-ARCHITECTURE.md](docs/REALTIME-ARCHITECTURE.md) | WebSocket protocol, presence, typing |
| [docs/SECURITY-PLAN.md](docs/SECURITY-PLAN.md) | Security implementation notes |
| [docs/PENETRATION-TEST.md](docs/PENETRATION-TEST.md) | Manual security test results |
| [docs/DEPLOYMENT-OPTIONS.md](docs/DEPLOYMENT-OPTIONS.md) | Docker Compose vs cloud deployment |
| [docs/REPO-SECURITY.md](docs/REPO-SECURITY.md) | Repository access and branch protection |
| [docs/AI-CHAT-LOGS.md](docs/AI-CHAT-LOGS.md) | AI assistance session links (attribution) |
| [docs/MOODLE-SUBMISSION.md](docs/MOODLE-SUBMISSION.md) | Moodle submission text |
| [docs/PROJECT-CHECKLIST.md](docs/PROJECT-CHECKLIST.md) | Pre-submission checklist |
| [ATTRIBUTION.md](ATTRIBUTION.md) | Libraries, AI sessions, team contributions |

---

## License

Academic project — B9IS103. See [ATTRIBUTION.md](ATTRIBUTION.md).
