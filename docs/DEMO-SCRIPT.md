# StudySafe — Live Demo Guide

Step-by-step walkthrough for team briefing (Tuesday) and professor presentation (Wednesday).

**Duration:** ~15 minutes  
**Live URL:** https://16.16.138.41 (accept self-signed certificate)  
**Prerequisites:** Two browsers, two different email addresses

---

## What you are demonstrating

| Goal | Evidence |
|------|----------|
| Realtime secure collaboration | Teams-style UI, live presence, typing indicators |
| End-to-end encryption | Padlocks on messages; ciphertext in MongoDB / DevTools |
| Identity | Email OTP + JWT — no passwords stored |
| Trust model | Fingerprint verification blocks send until peers verified |
| Forward secrecy on membership change | Crypto epoch rotates on join-without-history / leave |

---

## 1. Login (Browser A — Alice)

1. Open https://16.16.138.41
2. Enter email and display name **Alice** → **Send OTP**
3. Check email (or backend log if local) → enter OTP → **Dashboard**
4. UI: left **icon rail** + **channel sidebar** (Microsoft Teams layout)

**Say:** "Passwordless OTP — server never stores passwords."

---

## 2. Create channel (Alice)

1. Click **+ New channel** → name e.g. **Security Lab**
2. Note the **invite code** in the success toast and channel header
3. Open the channel — banner shows trust status (yellow until peers verified)

**Say:** "Invite-only — room name alone is not enough; you need the 6-character code."

---

## 3. Join channel (Browser B — Bob)

1. Incognito / second browser → sign in as **Bob** with a **different email**
2. **Join with code** → paste invite code
3. Leave **Share chat history** unchecked (default) — keys will rotate
4. Both browsers show **Live** connection badge and online avatars

**Say:** "Default join rotates encryption epoch — old ciphertext keys are invalidated on the server."

---

## 4. Trust & keys (both users)

1. Open **Trust & keys** tab (mobile) or right panel (desktop)
2. Each user reads their SHA-256 fingerprint aloud (or via Zoom chat)
3. Click **Verify** for the teammate's key
4. Banner turns green: **End-to-end secured**

**Say:** "This is two-way verification — blocks MITM if someone swapped keys on the server. Send is disabled until everyone is verified."

---

## 5. Encrypted chat

1. Alice sends: `Meeting password is X`
2. Bob sees plaintext with **padlock** icon
3. Alice types without sending → Bob sees typing indicator

**Say:** "Plaintext never leaves the browser unencrypted."

---

## 6. Prove the server is blind (optional deep dive)

| Check | How |
|-------|-----|
| Ciphertext on wire | DevTools → Network → WS → message frame = JSON base64 blob |
| Ciphertext in DB | MongoDB `messages.ciphertext_payload` — unreadable |
| No decrypt API | https://16.16.138.41/docs — no decrypt endpoint |
| Auth required | `/api/rooms/mine` without JWT → 401 |

---

## 7. Key rotation demo (optional, 2 min)

1. Bob clicks **Leave room** in Trust & keys panel
2. Alice sees **keys rotated** — epoch increments
3. Alice must re-verify if a new member joins

**Say:** "When membership changes, we don't trust old keys — epoch bumps and public keys are cleared server-side."

---

## 8. Automated tests (if asked)

```bash
cd backend && pytest -v
cd frontend && npm test && npm run build
```

CI badge on README runs these on every push.

---

## Common pitfalls

| Problem | Fix |
|---------|-----|
| Same email in both browsers | Use two different emails — same email = same user |
| Cannot send messages | Verify all peer keys in Trust & keys first |
| Web Crypto error | Must use HTTPS — accept self-signed cert on EC2 |
| Bob cannot find room | Join with **invite code**, not channel name |

---

## Local alternative

```bash
cd backend && uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

App: http://localhost:5173 — OTP in terminal: `[DEV OTP] email=... code=...`

---

## After Wednesday — peer penetration testing

Share repo with peer groups per course instructions. Scope and rules: [PEN-TEST-SCOPE.md](PEN-TEST-SCOPE.md)
