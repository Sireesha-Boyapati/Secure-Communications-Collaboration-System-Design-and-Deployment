# AI Chat Session Logs — StudySafe

**DEADLINE: Paste all 12 links before 11 PM submission tonight.**

Per assignment requirements, AI assistance is documented in **separate sessions** — each covering a distinct development stage.

---

## How to get your links (15 minutes)

1. Open **Cursor** → click **Chat history** (clock icon)
2. Find chats matching the topics below (or create/share from current sessions)
3. Click **Share** on each chat → copy the URL
4. Replace `YOUR_LINK_HERE` in the table below
5. Commit and push: `git add docs/AI-CHAT-LOGS.md && git commit -m "docs: add AI chat session links" && git push`

**Tip:** If you cannot find old chats, use today's Cursor sessions covering each topic — professor needs separate sessions, not one long chat.

---

## Session index

| # | Topic | Stage | Link |
|---|-------|-------|------|
| 1 | Project idea, requirements analysis, architecture discussion | Planning | [Chat 1 — Project & Requirements](YOUR_LINK_HERE) |
| 2 | Frontend planning, UI structure, component layout | Frontend design | [Chat 2 — Frontend Planning](YOUR_LINK_HERE) |
| 3 | Backend API design, service layer, repository pattern | Backend design | [Chat 3 — Backend API Design](YOUR_LINK_HERE) |
| 4 | Database design, MongoDB collections, indexes | Database | [Chat 4 — Database Design](YOUR_LINK_HERE) |
| 5 | Security analysis, threat modelling, attack tables | Security | [Chat 5 — Security & Threat Model](YOUR_LINK_HERE) |
| 6 | Docker containerisation, docker-compose setup | DevOps | [Chat 6 — Docker Setup](YOUR_LINK_HERE) |
| 7 | CI/CD pipeline, GitHub Actions workflow | DevOps | [Chat 7 — CI/CD Pipeline](YOUR_LINK_HERE) |
| 8 | Web Crypto E2E encryption implementation | Crypto | [Chat 8 — E2E Encryption](YOUR_LINK_HERE) |
| 9 | Testing strategy, pytest, vitest, debugging | Testing | [Chat 9 — Testing & Debugging](YOUR_LINK_HERE) |
| 10 | Cloud deployment planning (AWS EC2, ALB, SES) | Deployment | [Chat 10 — Cloud Deployment](YOUR_LINK_HERE) |
| 11 | README and documentation improvement | Documentation | [Chat 11 — README & Docs](YOUR_LINK_HERE) |
| 12 | Production refactor — auth, MongoDB, integration | Integration | [Chat 12 — Production Integration](YOUR_LINK_HERE) |

---

## What each session should contain (for professor review)

### Chat 1 — Project & Requirements
- Four project proposals comparison
- Selection of StudySafe (Idea 1)
- Functional / non-functional / security requirements
- High-level architecture diagram

### Chat 2 — Frontend Planning
- React + TypeScript + Vite structure
- Page flow: Login → Dashboard → Chat
- Component hierarchy
- CSS design approach

### Chat 3 — Backend API Design
- FastAPI router structure
- Service layer vs repository layer
- JWT + OTP auth flow
- WebSocket endpoint design

### Chat 4 — Database Design
- MongoDB collections schema
- Index strategy (TTL on OTP, unique email)
- Ciphertext-only message storage

### Chat 5 — Security & Threat Model
- Trust boundaries
- Attack scenario table
- Rate limiting, honeypot, headers
- Golden rule: no plaintext on server

### Chat 6 — Docker Setup
- Multi-container docker-compose
- Backend Dockerfile
- Frontend nginx reverse proxy
- Environment variable management

### Chat 7 — CI/CD Pipeline
- GitHub Actions workflow
- MongoDB service container for tests
- Build + test on push to main

### Chat 8 — E2E Encryption
- ECDH P-256 key agreement
- AES-256-GCM encrypt/decrypt
- Fingerprint generation
- Per-recipient encryption

### Chat 9 — Testing & Debugging
- pytest API tests
- vitest crypto tests
- Manual two-browser demo steps
- Common bugs and fixes

### Chat 10 — Cloud Deployment
- AWS EC2 + ALB + ACM
- MongoDB Atlas
- AWS SES for OTP
- Secrets Manager

### Chat 11 — README & Docs
- Professional README structure (17 sections)
- Security tables for professor
- Attribution requirements

### Chat 12 — Production Integration
- Migrating from demo to production skeleton
- MongoDB persistence
- JWT-protected WebSocket
- Frontend auth context + API client

---

## Team note

Each team member should have contributed to at least 2 chat sessions. Update [ATTRIBUTION.md](../ATTRIBUTION.md) with individual contributions before final submission.
