# StudySafe — How We Built It with Cursor AI

**Team:** Mahendra · Sireesha · Oree · Sudheer  
**Tool:** Cursor AI — all output reviewed by the team before merge  
**Live app:** https://studysafe.duckdns.org

This document describes **how we started from scratch** and built StudySafe step by step using Cursor AI.

Full **Cursor prompts** are in [AI-CHAT-LOGS.md](AI-CHAT-LOGS.md).

---

## How we started

1. **June 2026** — We asked Cursor to generate **four project ideas** for a secure communications app. We picked **StudySafe** (encrypted team chat for student groups).

2. **Early July** — Cursor helped define the **tech stack**: React, FastAPI, MongoDB, Web Crypto API, AWS.

3. **July 1–5** — First working **demo**: WebSocket relay + browser E2E encryption (ciphertext only on the wire).

4. **July 6–14** — **Production backend**: MongoDB, email OTP, JWT, services layer, security controls.

5. **Mid July** — **Frontend flow**: Login → Dashboard → encrypted chat; then WebSocket presence and typing.

6. **Late July** — **Docker, CI, AWS deployment** on EC2 with DuckDNS and Let's Encrypt.

7. **Final phase** — **Trust verification**, crypto epoch / key rotation, Teams-style UI polish, live at studysafe.duckdns.org.

---

## Build timeline

| Step | What we built | Main files |
|------|---------------|------------|
| 1 | Project ideas → StudySafe | Early docs, team decision |
| 2 | Tech stack | `docs/TECH-STACK.md`, `docs/WHY-TECH-CHOICES.md` |
| 3 | E2E demo | `frontend/src/lib/crypto.ts`, WebSocket relay |
| 4 | Production API | `backend/app/services/`, `db/repositories/` |
| 5 | Security + crypto | `docs/SECURITY-PLAN.md`, rate limit, honeypot |
| 6 | React UI + OTP | `LoginPage.tsx`, `DashboardPage.tsx`, `ChatRoom.tsx` |
| 7 | Realtime + Docker + CI | `REALTIME-ARCHITECTURE.md`, `docker-compose.yml`, `.github/workflows/ci.yml` |
| 8 | Trust + AWS production | `trustStore.ts`, `deploy/aws/`, studysafe.duckdns.org |

**Commit history:** https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment/commits/main

---

## What Cursor did vs what we did

| Cursor AI | Team |
|-----------|------|
| Project ideas, stack suggestions, code scaffolding | Chose StudySafe, reviewed all security code |
| Backend/frontend structure, Docker, deploy scripts | Fixed bugs, tested OTP, deployed to AWS |
| README and security docs drafts | Peer testing, demo prep, final UI polish |

**Rule we enforced:** plaintext never reaches the backend or MongoDB. Crypto uses **Web Crypto API only** — no custom algorithms.

---

## Cursor Share links

Cursor Share (`https://cursor.com/s/...`) was not available on our account. We recorded the **exact prompts** we used in [AI-CHAT-LOGS.md](AI-CHAT-LOGS.md).
