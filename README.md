# StudySafe

**Encrypted real-time collaboration for student teams** — B9IS103 Computer Systems Security 2026

[![CI](https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/actions/workflows/ci.yml/badge.svg)](https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/actions)

| | |
|---|---|
| **Module** | B9IS103 — Computer Systems Security 2026 |
| **Assessment** | Secure Communications / Collaboration System Design and Deployment |
| **Team** | Mahendra · Sireesha · Oree · Sudheer |
| **Stack** | React · FastAPI · MongoDB · AWS |
| **Repository** | [GitHub](https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment) |

---

## Quick start

```bash
docker compose up mongodb -d
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

Open http://localhost:5173 · API docs http://localhost:8000/docs · Full walkthrough: [docs/DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md)

---

## 1. Project Overview

StudySafe is a self-hosted secure messaging platform for student project teams. Users authenticate with **email OTP**, join encrypted chat rooms via **invite codes**, and exchange messages that are **encrypted in the browser** before reaching the server.

The backend is a **ciphertext relay** — it never decrypts messages. MongoDB stores only encrypted payloads and public keys. Identity is established via **email OTP**; encryption keys are agreed with **ECDH** without users meeting in person.

**Assessment coverage:** [docs/REQUIREMENTS-COMPLIANCE.md](docs/REQUIREMENTS-COMPLIANCE.md) maps every brief requirement to code and documentation.

---

## 1a. Assessment alignment (B9IS103)

| Mark component | Weight | Evidence in this repository |
|----------------|--------|----------------------------|
| Design and implementation | 40 | Architecture (§3–§9), working code, [docs/IMPLEMENTATION-MAP.md](docs/IMPLEMENTATION-MAP.md), [docs/DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md) |
| Vulnerability analysis (peer system 1) | 20 | [docs/PEER-SYSTEM-ANALYSIS.md](docs/PEER-SYSTEM-ANALYSIS.md) §Peer System 1 |
| Vulnerability analysis (peer system 2) | 20 | [docs/PEER-SYSTEM-ANALYSIS.md](docs/PEER-SYSTEM-ANALYSIS.md) §Peer System 2 |
| Reactive analysis and improvements | 20 | §12 Attack Scenarios, §13 Remediation, peer doc §Reactive analysis |

---

## 1b. System requirements

### Functional requirements

| ID | Requirement | Implementation |
|----|-------------|----------------|
| FR-1 | User registration and login | Email OTP → JWT (`backend/app/services/auth_service.py`, `frontend/src/pages/LoginPage.tsx`) |
| FR-2 | Create and join collaboration rooms | Invite codes (`backend/app/services/room_service.py`, `DashboardPage.tsx`) |
| FR-3 | Exchange encrypted messages in real time | WebSocket relay + client crypto (`main.py`, `ChatRoom.tsx`, `lib/crypto.ts`) |
| FR-4 | Key agreement without prior meeting | ECDH P-256 public-key registry per room |
| FR-5 | Message history | Ciphertext stored in MongoDB; decrypted on client rejoin |
| FR-6 | Presence and typing | WebSocket events (`backend/app/websocket/`, realtime UI components) |

### Non-functional requirements

| ID | Requirement | Implementation |
|----|-------------|----------------|
| NFR-1 | Confidentiality of message content | E2E AES-256-GCM; server stores ciphertext only |
| NFR-2 | Availability | Docker Compose, health endpoint, WebSocket auto-reconnect |
| NFR-3 | Maintainability | Layered backend (routers → services → repositories), typed frontend |
| NFR-4 | Auditability | Structured logging, honeypot, Git history on GitHub |
| NFR-5 | Deployability | Dockerfiles, `docker-compose.yml`, AWS outline in `deploy/README.md` |

### Security requirements

| ID | Requirement | Implementation |
|----|-------------|----------------|
| SR-1 | Authenticate participants | Email OTP + JWT on REST and WebSocket |
| SR-2 | Authorize room access | Membership checks before messages and WS connect |
| SR-3 | No security through obscurity | Standard Web Crypto API; documented algorithms |
| SR-4 | Maliciously curious relay | Server cannot decrypt; documented in §10–§11 |
| SR-5 | Rate limiting and abuse controls | slowapi OTP and API limits |
| SR-6 | Input validation | Pydantic schemas on all REST bodies |
| SR-7 | Key integrity | SHA-256 fingerprint for out-of-band verification |

### Identity verification design

StudySafe uses **communications-channel identity** (assignment-permitted model):

1. **Email OTP** — proves control of an email address at login time (AWS SES in production; console log in development).
2. **JWT session** — binds API and WebSocket actions to the verified user ID.
3. **Key fingerprint** — SHA-256 hash of the user's public key; teammates verify on a second channel (phone, Zoom, in person) to detect server key substitution.

We do **not** trust the email provider or relay server with message confidentiality — only with delivery of the OTP and transport of ciphertext.

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

1. User enters email → receives OTP (logged to console in dev, SES in prod)
2. User verifies OTP → receives JWT
3. User creates room or joins with invite code
4. Browser generates ECDH key pair, registers public key with server
5. User opens WebSocket (JWT in query string)
6. On send: encrypt for each peer → JSON payload → WebSocket → server stores ciphertext → broadcast
7. Recipients decrypt locally with their private key

### Realtime Features

- **Online presence** — see who is connected in each room (WebSocket + REST snapshot)
- **Typing indicators** — ephemeral typing events relayed without persisting content
- **Auto-reconnect** — WebSocket client retries with backoff after network drops
- **Encrypted history** — ciphertext message history loaded and decrypted on room join


### Layered backend

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

## 18. Peer vulnerability analysis

The assignment requires analysis of **two other groups' systems**. Use [docs/PEER-SYSTEM-ANALYSIS.md](docs/PEER-SYSTEM-ANALYSIS.md) to document:

- Architecture and trust assumptions for each assigned peer project
- Proposed interception and weakness attacks
- Mitigations you would recommend to those teams
- **Reactive analysis** — responses to attacks other groups raise against StudySafe (cross-linked to §12–§13)

Fill peer project names and findings when groups are assigned.

---

## Documentation index

| Document | Purpose |
|----------|---------|
| [docs/DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md) | Live demo walkthrough (local setup → two-user encrypted chat) |
| [docs/REQUIREMENTS-COMPLIANCE.md](docs/REQUIREMENTS-COMPLIANCE.md) | Brief requirements mapped to code |
| [docs/IMPLEMENTATION-MAP.md](docs/IMPLEMENTATION-MAP.md) | README sections and features → source files |
| [docs/PEER-SYSTEM-ANALYSIS.md](docs/PEER-SYSTEM-ANALYSIS.md) | Vulnerability analysis of two peer systems + reactive rebuttals |
| [docs/REALTIME-ARCHITECTURE.md](docs/REALTIME-ARCHITECTURE.md) | WebSocket protocol, presence, typing |
| [docs/SECURITY-PLAN.md](docs/SECURITY-PLAN.md) | Security implementation notes |
| [docs/PENETRATION-TEST.md](docs/PENETRATION-TEST.md) | Manual security test results |
| [docs/DEPLOYMENT-OPTIONS.md](docs/DEPLOYMENT-OPTIONS.md) | Docker Compose vs cloud deployment |
| [docs/REPO-SECURITY.md](docs/REPO-SECURITY.md) | Repository access and branch protection |
| [docs/AI-CHAT-LOGS.md](docs/AI-CHAT-LOGS.md) | AI assistance session links (attribution) |
| [docs/MOODLE-SUBMISSION.md](docs/MOODLE-SUBMISSION.md) | Moodle online text + zip checklist |
| [docs/PROJECT-CHECKLIST.md](docs/PROJECT-CHECKLIST.md) | Pre-submission verification checklist |
| [ATTRIBUTION.md](ATTRIBUTION.md) | Libraries, references, team contributions |

---

## License & attribution

Academic project for B9IS103. See [ATTRIBUTION.md](ATTRIBUTION.md) for libraries, references, and AI chat session links.
