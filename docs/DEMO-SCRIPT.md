# StudySafe — Live Demo Guide

Step-by-step walkthrough for team briefing and professor presentation.

**Duration:** ~15 minutes  
**Live URL:** https://studysafe.duckdns.org  
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

1. Open https://studysafe.duckdns.org
2. Enter email and display name **Alice** → **Continue with email**
3. Check Gmail for OTP → enter code → **Enter workspace**
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

**Say:** "Two-way verification blocks MITM if someone swapped keys on the server. Send is disabled until everyone is verified."

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
| No decrypt API | https://studysafe.duckdns.org/docs — no decrypt endpoint |
| Auth required | `/api/rooms/mine` without JWT → 401 |

---

## 7. Key rotation demo (optional)

1. Bob clicks **Leave room** in Trust & keys
2. Alice sees **keys rotated** — epoch increments
3. Re-verify keys when a new member joins

---

## Common pitfalls

| Problem | Fix |
|---------|-----|
| Same email in both browsers | Use two different emails |
| Cannot send messages | Verify all peer keys in Trust & keys |
| OTP not received | Check Gmail spam; verify SMTP in EC2 `.env` |

---

## After final demo — peer penetration testing

Share repo with peer groups per course instructions. Scope: [PEN-TEST-SCOPE.md](PEN-TEST-SCOPE.md)

**Live target for testers:** https://studysafe.duckdns.org
