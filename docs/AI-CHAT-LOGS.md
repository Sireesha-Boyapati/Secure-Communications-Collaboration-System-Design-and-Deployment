# StudySafe — Cursor AI Prompts

**Tool:** Cursor AI · **Team:** Mahendra, Sireesha, Oree, Sudheer

Cursor Share links were not available on our account. Below are the **prompts we used** at each stage of development.

See also: [CURSOR-AI-DEVELOPMENT.md](CURSOR-AI-DEVELOPMENT.md) (how we started and build timeline).

---

## Prompt 1 — Project ideas (how we started)

```
We are a group of 4 students building a secure communications / collaboration system.
We must design and deploy an encrypted app where two parties who never met can exchange keys.

Requirements:
- Self-hosted relay OR email/social integration
- Identity verification (email, PKI, social media, etc.)
- No security through obscurity
- Deploy to cloud (AWS)
- MongoDB for persistence
- Document threat model

Give us 4 different daily-life project ideas (not generic). For each idea include:
- Use case students/people actually face
- Functional + security requirements
- Identity verification approach
- Tech stack (React, FastAPI, MongoDB, AWS)
- Why it fits the project

We will review as a team and pick one.
```

**Result:** Four ideas — we selected **StudySafe** (encrypted team chat).

---

## Prompt 2 — Tech stack

```
We selected StudySafe: encrypted realtime group chat for student teams.

Help us define a production-oriented tech stack that satisfies:
- Client-side E2E encryption (parties never met to exchange keys)
- Realtime WebSocket chat
- Email OTP authentication + JWT
- MongoDB persistence on AWS

For each technology choice explain:
1. What alternatives exist
2. Why we picked it for THIS project
3. How it maps to the requirements

Output: TECH-STACK.md and WHY-TECH-CHOICES.md structure.
```

**Result:** React + TypeScript, FastAPI, MongoDB Atlas, Web Crypto API, AWS EC2.

---

## Prompt 3 — E2E demo (first working version)

```
Build a minimal StudySafe demo:
- FastAPI backend with WebSocket relay and in-memory public key registry
- React frontend that generates ECDH keys in browser, encrypts messages, sends ciphertext
- No MongoDB yet — prove E2E flow works locally
```

**Result:** Working demo — encrypt in browser, relay ciphertext only.

---

## Prompt 4 — Production backend

```
Build a production FastAPI backend skeleton for StudySafe — NOT an in-memory demo.

Requirements:
- Layered architecture: routers → services → db/repositories
- Motor async MongoDB (users, otp_codes, rooms, room_keys, messages)
- Pydantic v2 schemas for all REST bodies
- Email OTP → JWT auth on all protected routes
- Structured logging and custom exceptions
- config.py from .env (pydantic-settings)

Do not put business logic in routers.
```

**Result:** `auth_service`, `room_service`, `message_service`, MongoDB repositories.

---

## Prompt 5 — MongoDB design

```
Design MongoDB collections for StudySafe E2E encrypted chat.

Rules:
- NEVER store plaintext messages
- Store public keys (JWK) per user per room
- OTP codes must expire (TTL index)
- Room membership for authorization

Provide: collection schemas, example documents, indexes, and Python Motor repository pattern.
```

**Result:** Five collections — users, otp_codes, rooms, room_keys, messages (ciphertext only).

---

## Prompt 6 — Security

```
We need security documentation and working controls:

1. Threat model (assets, threats, mitigations)
2. Attack scenario table: Vulnerability | Who Can Attack | How | Impact | Prevention
3. Rate limiting, JWT auth, honeypot, security headers

Assume maliciously curious server — server must not see plaintext.
```

**Result:** `SECURITY-PLAN.md`, rate limit, honeypot, security headers.

---

## Prompt 7 — Client-side encryption

```
Implement REAL client-side E2E encryption for StudySafe using Web Crypto API only.
No dummy base64 obfuscation. No server-side message crypto.

Requirements:
- Two users who never met must agree keys without pre-sharing secrets
- ECDH P-256 key agreement
- AES-256-GCM encrypt/decrypt
- SHA-256 fingerprint for out-of-band verification
- Private keys NEVER sent to server

Provide: frontend/src/lib/crypto.ts with generateKeyPair, encryptForRecipient, decryptFromSender.
```

**Result:** `frontend/src/lib/crypto.ts` — Web Crypto API only.

---

## Prompt 8 — Frontend UI

```
Build production React frontend for StudySafe:

Pages:
1. LoginPage — email OTP request + verify + display name
2. DashboardPage — create room, join with invite code, list my rooms
3. ChatPage — encrypted realtime chat with fingerprint display

Requirements:
- TypeScript, React Router, protected routes
- API client with JWT in Authorization header
- AuthContext for session state
- Error handling (wrong OTP, network errors)
- Production folder: api/, components/, context/, pages/, lib/, types/
```

**Result:** Login → Dashboard → Chat flow.

---

## Prompt 9 — WebSocket realtime

```
Add production WebSocket realtime to StudySafe:

- WS endpoint: /ws/{room_id}?token=JWT
- Verify JWT and room membership before accept
- Relay encrypted message JSON without parsing plaintext
- Add presence (online users) and typing indicators (not stored in DB)
- Client auto-reconnect with backoff
- Document protocol in REALTIME-ARCHITECTURE.md
```

**Result:** Presence, typing indicators, live connection badge.

---

## Prompt 10 — Docker and AWS

```
Help us containerise StudySafe and plan AWS deployment:

1. docker-compose.yml — mongodb + backend + frontend
2. Dockerfiles with health checks
3. deploy/aws/ — EC2 setup, deploy scripts, env template
4. GitHub Actions CI: pytest + frontend build
```

**Result:** Docker Compose, `deploy/aws/`, CI workflow.

---

## Prompt 11 — Documentation

```
Create professional GitHub README with:
Overview, Architecture, Stack, Security, Threat Model, Attack Scenarios,
Deployment, Local Setup, Testing.

Also: demo script, attribution for AI use, pen-test scope.
Team should understand full system from README.
```

**Result:** README, DEMO-SCRIPT.md, ATTRIBUTION.md, PEN-TEST-SCOPE.md.

---

## Prompt 12 — Production polish

```
Complete StudySafe as a production-style realtime app:

- Two-way fingerprint trust verification (block send until peers verified)
- Crypto epoch + key rotation when user joins without history or leaves room
- Microsoft Teams–style UI polish
- AWS production deployment with DuckDNS + Let's Encrypt + Gmail OTP
- Update documentation for demo and pen-test scope
```

**Result:** Trust store, key rotation, Teams UI, https://studysafe.duckdns.org.
