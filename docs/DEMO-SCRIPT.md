# StudySafe — Professor demo script (15 minutes)

Step-by-step flow for OTP login, two-browser realtime chat, typing, and presence.

---

## Before you start

1. Start MongoDB and backend (`uvicorn app.main:app --reload --port 8000`).
2. Start frontend (`npm run dev` in `frontend/`).
3. Open **Browser A** (Chrome) and **Browser B** (Incognito or Firefox).

---

## Step 1 — OTP registration (Browser A)

1. Go to http://localhost:5173
2. Enter email `alice@studysafe.test` and display name **Alice**
3. Click **Send OTP**
4. Copy OTP from backend terminal: `[DEV OTP] email=... code=......`
5. Verify OTP → land on **Dashboard**

**Say:** Passwordless OTP + JWT — no passwords stored.

---

## Step 2 — Create encrypted room (Browser A)

1. Create room **"Security Lab"**
2. Copy **invite code** from dashboard
3. Open room → note **key fingerprint** box

---

## Step 3 — Second user joins (Browser B)

1. Register **Bob** with another email via OTP
2. **Join room** with invite code
3. Both browsers should show **Live now (2)** in presence strip

**Say:** WebSocket presence is in-memory metadata only — not encrypted message content.

---

## Step 4 — Typing indicators

1. In Browser A, type (do not send) in the composer
2. Browser B shows **Bob is typing…** (or Alice, depending on browser)

**Say:** Typing events are relay-only; never stored in MongoDB.

---

## Step 5 — Encrypted message + Network tab proof

1. Send a message from Browser A
2. Open DevTools → **Network** → WS frame or REST message payload
3. Show **ciphertext only** on the wire

**Say:** Server is a ciphertext relay — golden rule from README.

---

## Step 6 — REST presence fallback (optional)

1. Briefly stop WebSocket (disconnect Wi‑Fi for 5s or throttle in DevTools)
2. Presence list refreshes via `GET /api/rooms/{id}/online` every 30s

**Reference:** [REALTIME-ARCHITECTURE.md](REALTIME-ARCHITECTURE.md)

---

## Closing checklist

- [ ] Two users online with live badge
- [ ] Typing indicator visible
- [ ] Encrypted payload in Network tab
- [ ] Swagger `/docs` shows room + online endpoints
