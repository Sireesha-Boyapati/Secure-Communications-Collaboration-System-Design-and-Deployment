# StudySafe — Live Demo Guide

End-to-end walkthrough for local setup, OTP authentication, and realtime encrypted chat between two users.

**Duration:** ~15 minutes  
**Prerequisites:** Docker (optional), Python 3.12+, Node.js 20+, two browsers

---

## 1. Start the stack

```bash
# Terminal 1 — database + API
docker compose up mongodb -d
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env   # first run only
uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend (run inside WSL/Linux, not Windows CMD on UNC paths)
cd frontend
npm install            # first run only
npm run dev
```

| Service | URL |
|---------|-----|
| Application | http://localhost:5173 |
| OpenAPI docs | http://localhost:8000/docs |
| Health check | http://localhost:8000/health |

---

## 2. User A — register and create a room

1. Open **Browser A** → http://localhost:5173
2. Enter email `alice@studysafe.test` and display name **Alice**
3. Click **Send OTP**
4. In Terminal 1, copy the code from: `[DEV OTP] email=... code=......`
5. Enter OTP → verify → **Dashboard**
6. Create room **Security Lab**
7. Copy the **invite code**
8. Open the room → note the **key fingerprint** in the chat header

**Demonstrates:** communications-channel identity (email OTP), JWT session, room creation.

---

## 3. User B — join the same room

1. Open **Browser B** (incognito or second browser)
2. Register **Bob** with a different email via OTP
3. **Join room** using the invite code
4. Confirm both browsers show **Live** badge and **Live now (2)**

**Demonstrates:** invite-only access, WebSocket presence, authenticated relay.

---

## 4. Realtime features

| Feature | Action | Expected result |
|---------|--------|-----------------|
| Typing indicator | Type in Browser A without sending | Browser B shows typing animation |
| Encrypted send | Send a message from Browser A | Browser B decrypts and displays plaintext |
| Ciphertext on wire | DevTools → Network → WS or REST | Payload is JSON ciphertext, not readable message |
| History on rejoin | Refresh Browser A | Prior messages load and decrypt |
| Auto-reconnect | Brief network drop | **Live** badge returns after reconnect |

**Demonstrates:** E2E encryption, maliciously curious server model (relay sees ciphertext only).

---

## 5. Security evidence (optional deep dive)

| Check | How |
|-------|-----|
| API requires auth | Open `/api/rooms/mine` without token → 401 |
| OpenAPI | http://localhost:8000/docs — typed auth, rooms, messages, online |
| Rate limiting | Rapid OTP requests → 429 after limit |
| Honeypot | `GET /api/admin/users` → decoy JSON; IP logged in backend |
| Automated tests | `cd backend && pytest -v` · `cd frontend && npm test && npm run build` |
| CI | GitHub Actions badge on README |

---

## 6. Docker one-command alternative

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

Frontend: http://localhost:5173 · API: http://localhost:8000/docs

---

## 7. Assessment alignment (what this demo proves)

| CA requirement (40 marks design) | Demo evidence |
|----------------------------------|---------------|
| Encrypted messaging without pre-meeting key exchange | ECDH key agreement via server public-key registry |
| Identity authentication | Email OTP + JWT |
| Self-hosted relay | FastAPI WebSocket + MongoDB ciphertext store |
| Documented security | README §10–§13, `docs/SECURITY-PLAN.md` |
| Realtime collaboration | Presence, typing, encrypted group chat |

Peer vulnerability analysis (20 + 20 marks): [PEER-SYSTEM-ANALYSIS.md](PEER-SYSTEM-ANALYSIS.md)  
Reactive mitigations (20 marks): README §12–§13 and peer doc §Reactive analysis.
