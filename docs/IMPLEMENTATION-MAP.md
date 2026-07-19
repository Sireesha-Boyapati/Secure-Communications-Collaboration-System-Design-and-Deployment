# StudySafe — Implementation Map

This document maps **every README section**, **docs file**, and **demo feature** to the exact code that implements it. Use this when explaining the project to your professor or preparing the submission report.

---

## Quick answer: Is OTP registration implemented?

**Yes — fully working in local/dev mode.**

| Step | What happens | Code |
|------|----------------|------|
| 1. User enters email | Frontend calls `POST /api/auth/otp/request` | `frontend/src/pages/LoginPage.tsx` → `frontend/src/api/auth.ts` |
| 2. Server generates 6-digit OTP | Stored in MongoDB `otp_codes` with 10-min expiry | `backend/app/db/repositories/otp.py` → `backend/app/services/auth_service.py` |
| 3. OTP delivered | **Dev:** printed in backend terminal `[DEV OTP] email=... code=...` | `backend/app/services/email_service.py` |
| 4. User enters OTP + display name | Frontend calls `POST /api/auth/otp/verify` | `frontend/src/pages/LoginPage.tsx` |
| 5. Server verifies OTP | Creates user in `users` collection if new | `backend/app/services/auth_service.py` |
| 6. JWT issued | Token returned to frontend, stored in localStorage | `backend/app/auth/jwt.py` → `frontend/src/api/client.ts` |
| 7. Protected routes | All room/chat APIs require `Authorization: Bearer <token>` | `backend/app/auth/dependencies.py` |

**Demo OTP flow for professor:**
1. Start MongoDB + backend + frontend
2. Open http://localhost:5173 → enter `alice@college.ie`
3. Show backend terminal: `[DEV OTP] email=alice@college.ie code=123456`
4. Enter code + display name "Alice" → lands on dashboard
5. Show http://localhost:8000/docs → Auth section → try `/api/auth/me` with token

---

## README section → implementation

| README § | Topic | Primary docs | Backend code | Frontend code |
|----------|-------|--------------|--------------|---------------|
| §1 | Project Overview | `docs/STUDYSAFE.md` | `backend/app/main.py` | `frontend/src/App.tsx` |
| §2 | Business Problem | `docs/STUDYSAFE.md`, `docs/PROJECT-PROPOSALS.md` | — | — |
| §3 | Solution Architecture | `docs/TECH-STACK.md` | `backend/app/main.py`, `backend/app/websocket/manager.py` | `frontend/src/lib/crypto.ts` |
| §4 | Technology Stack | `docs/TECH-STACK.md`, `docs/WHY-TECH-CHOICES.md` | `backend/requirements.txt` | `frontend/package.json` |
| §5 | System Design | `docs/FOLDER-STRUCTURE.md` | `backend/app/services/` | `frontend/src/pages/` |
| §6 | Frontend Architecture | `docs/FOLDER-STRUCTURE.md` | — | `frontend/src/` tree |
| §7 | Backend Architecture | `docs/FOLDER-STRUCTURE.md` | `backend/app/` tree | — |
| §8 | Database Design | `docs/FOLDER-STRUCTURE.md` §MongoDB | `backend/app/db/repositories/` | — |
| §9 | API Documentation | `backend/app/routers/` | All routers | `frontend/src/api/` |
| §10 | Security Architecture | `docs/SECURITY-PLAN.md` | `backend/app/security/` | `frontend/src/lib/crypto.ts` |
| §11 | Threat Model | `README.md` §11, `docs/SECURITY-PLAN.md` | — | — |
| §12 | Attack Scenarios | `README.md` §12 table | `backend/app/security/honeypot.py`, `rate_limit.py` | `frontend/src/lib/crypto.ts` |
| §13 | Remediation Strategies | `README.md` §13 | `backend/app/security/middleware.py` | — |
| §14 | Deployment Steps | `deploy/README.md`, `docker-compose.yml` | `backend/Dockerfile` | `frontend/Dockerfile` |
| §15 | Local Setup | `README.md` §15 | `backend/.env.example` | `frontend/.env.example` |
| §16 | Testing Strategy | `README.md` §16 | `backend/tests/` | `frontend/src/lib/crypto.test.ts` |
| §17 | Future Improvements | `README.md` §17 | — | — |

---

## Docs file → what it documents → where implemented

| Doc file | Documents | Implemented in |
|----------|-----------|----------------|
| `docs/STUDYSAFE.md` | Project definition, MVP scope | `backend/app/main.py`, `frontend/src/pages/` |
| `docs/TECH-STACK.md` | Full stack diagram | `backend/requirements.txt`, `frontend/package.json`, `docker-compose.yml` |
| `docs/WHY-TECH-CHOICES.md` | Rationale for each technology | Architecture across `backend/app/`, `frontend/src/` |
| `docs/FOLDER-STRUCTURE.md` | Repo layout | Actual folder tree (this repo) |
| `docs/SECURITY-PLAN.md` | Trust model, golden rule | `backend/app/security/`, `frontend/src/lib/crypto.ts` |
| `docs/AI-CHAT-LOGS.md` | AI session links (12 chats) | Attribution only — fill links before submission |
| `docs/PROJECT-PROPOSALS.md` | Original 4 ideas | Historical — StudySafe selected in `docs/STUDYSAFE.md` |
| `docs/COMPARISON-MATRIX.md` | Idea comparison for lecturer | Historical presentation doc |
| `docs/meetings/*.md` | Meeting minutes | Process documentation |
| `ATTRIBUTION.md` | AI use, libraries, team | References all docs + code |
| `deploy/README.md` | AWS architecture plan | Planned — Docker works now |

---

## Feature → code map (for 70% demo)

| Feature | Status | Backend | Frontend | How to demo |
|---------|--------|---------|----------|-------------|
| Email OTP registration | ✅ Done | `routers/auth.py`, `services/auth_service.py` | `pages/LoginPage.tsx` | Sign in flow + backend log |
| JWT authentication | ✅ Done | `auth/jwt.py`, `auth/dependencies.py` | `api/client.ts`, `context/AuthContext.tsx` | `/api/auth/me` in Swagger |
| Create room | ✅ Done | `services/room_service.py`, `routers/rooms.py` | `pages/DashboardPage.tsx` | Create room → get invite code |
| Join room by invite | ✅ Done | `db/repositories/rooms.py` | `pages/DashboardPage.tsx` | Second user joins with code |
| Public key registry | ✅ Done | `db/repositories/rooms.py` | `api/rooms.ts`, `components/chat/ChatRoom.tsx` | Show fingerprint in chat UI |
| E2E encryption (ECDH + AES-GCM) | ✅ Done | — (client only) | `lib/crypto.ts` | Network tab shows ciphertext |
| WebSocket real-time relay | ✅ Done | `main.py` WS endpoint, `websocket/manager.py` | `lib/websocket.ts` | Two browsers, live message |
| Ciphertext persistence | ✅ Done | `db/repositories/messages.py` | — | MongoDB `messages` collection |
| Rate limiting | ✅ Done | `security/rate_limit.py` | — | Mention in security section |
| Honeypot endpoint | ✅ Done | `security/honeypot.py` | — | `GET /api/admin/users` → logged |
| Security headers | ✅ Done | `security/middleware.py` | — | DevTools response headers |
| Docker local stack | ✅ Done | `Dockerfile`, `docker-compose.yml` | `Dockerfile`, `nginx.conf` | `docker compose up` |
| CI pipeline | ✅ Done | `.github/workflows/ci.yml` | same workflow | GitHub Actions tab |
| AWS production deploy | ⏳ Planned | `deploy/README.md` | — | Explain as Phase 2 by 19th |
| Message history on join | ✅ Done | `ChatRoom.tsx` + `fetchMessageHistory` | Reload room — prior messages appear |
| AI chat links filled | ⏳ Tonight | — | `docs/AI-CHAT-LOGS.md` — paste 12 Cursor share URLs |

---

## MongoDB collections → repository

| Collection | Repository file | Purpose |
|------------|-----------------|---------|
| `users` | `backend/app/db/repositories/users.py` | Registered users after OTP verify |
| `otp_codes` | `backend/app/db/repositories/otp.py` | Temporary OTP codes (TTL index) |
| `rooms` | `backend/app/db/repositories/rooms.py` | Chat rooms + invite codes |
| `room_keys` | `backend/app/db/repositories/rooms.py` | Public keys per user per room |
| `messages` | `backend/app/db/repositories/messages.py` | Ciphertext payloads only |

---

## API endpoint → router → service

| Endpoint | Router | Service | Repository |
|----------|--------|---------|------------|
| `POST /api/auth/otp/request` | `routers/auth.py` | `auth_service` | `otp_repo` |
| `POST /api/auth/otp/verify` | `routers/auth.py` | `auth_service` | `otp_repo`, `user_repo` |
| `GET /api/auth/me` | `routers/auth.py` | — | `user_repo` |
| `POST /api/rooms` | `routers/rooms.py` | `room_service` | `room_repo` |
| `POST /api/rooms/join` | `routers/rooms.py` | `room_service` | `room_repo` |
| `GET /api/rooms/mine` | `routers/rooms.py` | `room_service` | `room_repo` |
| `POST /api/rooms/{id}/keys` | `routers/rooms.py` | `room_service` | `room_repo` |
| `GET /api/rooms/{id}/keys` | `routers/rooms.py` | `room_service` | `room_repo` |
| `GET /api/rooms/{id}/messages` | `routers/messages.py` | `message_service` | `message_repo` |
| `WS /ws/{room_id}?token=` | `main.py` | `message_service` | `room_repo`, `message_repo` |
| `GET /api/admin/users` | `security/honeypot.py` | — | Honeypot only |

---

## Testing → what it covers

| Test file | Covers | README § |
|-----------|--------|----------|
| `backend/tests/test_health.py` | API liveness, DB connection | §16 |
| `backend/tests/test_auth.py` | OTP validation, JWT protection | §10, §12 |
| `frontend/src/lib/crypto.test.ts` | ECDH key generation, fingerprint | §10 |
| `.github/workflows/ci.yml` | Runs all tests on push | §16 |

---

## Suggested professor walkthrough (70% demo)

1. **Git history** — show 25+ commits, steady progress
2. **README §12** — attack scenario table
3. **This file** — `docs/IMPLEMENTATION-MAP.md` → proves docs match code
4. **OTP registration** — LoginPage → backend log → dashboard
5. **Room create/join** — invite code flow
6. **Encrypted chat** — two browsers, ciphertext in Network tab
7. **Swagger** — http://localhost:8000/docs
8. **MongoDB** — show `users`, `otp_codes`, `messages` collections (optional)
9. **CI** — GitHub Actions badge (after push)

---

## Phase 2 by 19 July (remaining 30%)

| Task | Doc reference | Code to add |
|------|---------------|-------------|
| Wire message history in UI | §17 Future | `ChatRoom.tsx` + `api/rooms.ts` |
| AWS deploy | `deploy/README.md` | Terraform or manual EC2 guide |
| Fill 12 AI chat links | `docs/AI-CHAT-LOGS.md` | Replace `YOUR_LINK_HERE` |
| More integration tests | §16 | `backend/tests/test_rooms.py` |
| SES production email | `backend/app/services/email_service.py` | Set AWS env vars |
