# StudySafe — Selected Project

**Status:** Selected after lecturer review (Idea 1 from proposals)  
**Module:** B9IS103 — Secure Communications / Collaboration System  
**Team:** Mahendra, Sireesha, Oree, Sudheer

---

## One-line summary

**StudySafe** is an encrypted real-time group chat for student teams. Messages are encrypted in the browser before reaching our AWS server or MongoDB.

---

## Problem

Student teams coordinate daily on deadlines, passwords, and assignment splits using WhatsApp or Discord. Those platforms and any relay server can read metadata and, if compromised, message content.

## Solution

A self-hosted relay that **never sees plaintext**:

1. User verifies identity via **email OTP**
2. Browser generates **ECDH key pair** (private key never leaves device)
3. Messages encrypted with **AES-256-GCM** before send
4. Server + MongoDB store **ciphertext only**
5. Users verify **key fingerprints** on a second channel (Zoom / phone)

---

## MVP scope (Phase 1 — demo)

| Feature | Status |
|---------|--------|
| Real-time WebSocket chat | In progress |
| Client-side encryption (Web Crypto) | In progress |
| Room-based group chat | In progress |
| Public key exchange via server | In progress |
| Email OTP auth | Planned |
| MongoDB persistence | Planned |
| AWS deployment | Planned |
| Key fingerprint UI | Planned |

---

## Target users

- Project teams (3–20 members)
- Study groups
- Our B9IS103 team (first real users)

---

## Security principles

1. **No plaintext on server** — golden rule
2. **Maliciously curious server** — AWS and MongoDB are untrusted for confidentiality
3. **No security through obscurity** — standard algorithms only
4. **Identity** — email OTP + optional fingerprint verification
5. **Defense in depth** — JWT auth, rate limits, honeypot decoys (see SECURITY-PLAN.md)

---

## Demo script (for class)

1. Open app in Browser 1 → join room `B9IS103` as Alice
2. Open incognito Browser 2 → join as Bob
3. Alice sends: *"Assignment section 3 done"*
4. Show server logs / API — ciphertext only
5. Bob sees decrypted message
6. Show key fingerprints for verification

---

## Document links

- [TECH-STACK.md](TECH-STACK.md)
- [WHY-TECH-CHOICES.md](WHY-TECH-CHOICES.md)
- [FOLDER-STRUCTURE.md](FOLDER-STRUCTURE.md)
- [SECURITY-PLAN.md](SECURITY-PLAN.md)
