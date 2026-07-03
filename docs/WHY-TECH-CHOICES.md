# StudySafe — Why We Chose Each Technology

**Project:** StudySafe (B9IS103)  
**Purpose:** Justify stack decisions for report and lecturer review

---

## Summary table

| Choice | Alternatives considered | Why we chose it |
|--------|------------------------|-----------------|
| React + TypeScript | Vue, plain HTML | Component model for chat UI; TypeScript catches bugs early |
| Web Crypto API | crypto-js, forge | Browser-native, no extra library; private keys stay in browser |
| FastAPI | Node/Express, Django | Async WebSocket support, auto API docs, Python team skill |
| MongoDB Atlas | PostgreSQL RDS | Document model fits JSON messages/keys; easy Atlas free tier on AWS |
| AWS | Azure (module suggestion) | Team AWS access; ALB supports WebSocket well |
| WebSocket | SSE, polling | True real-time bidirectional chat |
| JWT + email OTP | Password-only | Passwords stored = attack surface; OTP proves email ownership |

---

## Frontend — React + TypeScript + Vite

**Why React?**  
Chat apps are UI-heavy (message list, input, user list, fingerprint modal). React components map cleanly to these parts and are widely documented.

**Why TypeScript?**  
Crypto code passes `ArrayBuffer`, `JsonWebKey`, and base64 strings — TypeScript prevents mixing these types, which could silently break encryption.

**Why Vite?**  
Faster dev server than Create React App; simple config; good for demo tomorrow.

**Why not plain HTML/JS?**  
Harder to maintain as a 4-person team; TypeScript + components scale better for auth and room features in Phase 2.

---

## Cryptography — Web Crypto API (browser only)

**Why client-side encryption?**  
This is the **core assignment requirement**. If we encrypt on the server, the server sees plaintext — defeating E2E.

**Why Web Crypto and not a npm crypto library?**  
- Built into modern browsers — no supply-chain risk from extra packages  
- Uses OS/browser secure random and key storage  
- Standard algorithms (ECDH P-256, AES-GCM) — no custom crypto  

**Why ECDH + AES-GCM?**  
- **ECDH:** Two parties who never met can agree a shared secret using only public keys  
- **AES-GCM:** Industry-standard authenticated encryption — detects tampering  

**Assignment alignment:** Directly satisfies *"messages encrypted between two parties who have not met to exchange keys"*.

---

## Backend — Python FastAPI

**Why FastAPI?**  
- Native **WebSocket** support for real-time relay  
- Automatic **OpenAPI** docs at `/docs` — lecturer can inspect API  
- **Async** — handles many concurrent chat connections  
- **Pydantic** validation — rejects malformed attacker payloads  

**Why Python?**  
Team comfort; strong crypto libraries available server-side for JWT (not message crypto); fast to prototype.

**Why not Node.js?**  
Equally valid; we chose Python for FastAPI's documentation and type hints. Message relay logic is simple in either language.

**Critical rule:** Server **never decrypts** messages — it only validates JWT and relays ciphertext JSON.

---

## Real-time — WebSocket

**Why WebSocket?**  
Assignment requires real-time collaboration. HTTP polling adds delay and wastes bandwidth. WebSocket gives instant push when a peer sends a message.

**Why WSS (WebSocket Secure)?**  
TLS encrypts transport; combined with E2E, we have defense in depth.

---

## Database — MongoDB Atlas

**Why MongoDB?**  
- Messages and public keys are **JSON documents** — natural fit  
- **MongoDB Atlas** free tier on AWS region — no self-managed DB admin for MVP  
- Schemaless enough for iterative development  

**Why not PostgreSQL?**  
Also fine; team preferred MongoDB document model for `{ciphertext, iv, roomId}` records.

**What we store:**  
Public keys, room metadata, encrypted message blobs, user email hashes.

**What we never store:**  
Private keys, plaintext, OTP codes (hashed only if stored).

---

## Cloud — AWS

**Why AWS?**  
Team has AWS access; services map clearly to assignment deployment requirement.

| Service | Why |
|---------|-----|
| EC2 | Simple first deployment; full control for demo |
| ALB | HTTPS + WebSocket on same endpoint |
| ACM | Free TLS certificates |
| SES | Email OTP for identity verification |
| Secrets Manager | JWT secret and DB URI not in Git |
| CloudWatch | Log honeypot hits and failed auth |

**Why not self-hosted at home?**  
Assignment asks for **cloud deployment**; AWS is auditable and available for lecturer testing.

---

## Identity — Email OTP + JWT

**Why email OTP?**  
Assignment lists *"communications channel based identity, e.g. email"*. OTP proves the user controls that email without us storing passwords.

**Why JWT?**  
Stateless session tokens after login; every API/WebSocket connection validates identity before relaying messages.

**Why fingerprint verification?**  
Mitigates malicious server swapping public keys (MITM). Users compare 6-digit code on Zoom — documented trust assumption.

---

## Security extras — Honeypot + branch protection

**Why honeypot fake JSON?**  
Supplementary layer — unauthorized scanners get decoy data; real security is JWT + E2E. Documented as **not** primary defense (no security through obscurity).

**Why GitHub branch protection?**  
Only team pushes to `main`; public clone does not allow unauthorized writes.

---

## What we explicitly rejected

| Rejected | Reason |
|----------|--------|
| Custom encryption algorithm | Assignment forbids; use standards only |
| Server-side message encryption | Breaks E2E trust model |
| Storing private keys in MongoDB | Instant fail of security requirements |
| WhatsApp/Telegram integration | Need our own deployed system for analysis |
| Password-only auth | Weaker identity proof than email OTP |

---

## Conclusion

Every technology serves either **E2E confidentiality**, **real-time delivery**, **identity verification**, or **cloud deployment** — the four pillars of the assignment brief.
