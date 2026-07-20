# StudySafe — Project Overview

**Team:** Mahendra · Sireesha · Oree · Sudheer

End-to-end encrypted realtime group chat for student project teams. Messages are encrypted in the browser before they reach AWS or MongoDB.

---

## Problem

Student teams coordinate on deadlines, credentials, and work splits using everyday chat tools. Those platforms store messages on third-party servers and cannot guarantee confidentiality if the relay is compromised.

## Solution

A self-hosted ciphertext relay that never sees plaintext:

1. User verifies identity via **email OTP**
2. Browser generates an **ECDH P-256** key pair (private key never leaves the device)
3. Messages are encrypted with **AES-256-GCM** before send
4. Server and MongoDB store **ciphertext only**
5. Users verify **SHA-256 key fingerprints** on a second channel (Zoom / phone)

---

## Features

| Feature | Status |
|---------|--------|
| Email OTP authentication + JWT sessions | Implemented |
| Invite-only rooms (6-character codes) | Implemented |
| Client-side E2E encryption (Web Crypto API) | Implemented |
| Public key registry per room | Implemented |
| WebSocket realtime chat | Implemented |
| Presence and typing indicators | Implemented |
| MongoDB Atlas persistence | Implemented |
| AWS EC2 production deployment (Docker + nginx) | Implemented |
| Key fingerprint verification UI | Implemented |

---

## Target users

- Project teams (3–20 members)
- Study groups
- Any small team that needs confidential coordination without trusting the server

---

## Security principles

1. **No plaintext on server** — golden rule
2. **Untrusted relay** — AWS and MongoDB are not trusted for message confidentiality
3. **Standard algorithms only** — Web Crypto API; no custom cryptography
4. **Defense in depth** — JWT auth, rate limits, honeypot decoys (see [SECURITY-PLAN.md](SECURITY-PLAN.md))

---

## Demo workflow

1. Open the app in Browser 1 → sign in as Alice with email A
2. Open an incognito window → sign in as Bob with **a different email**
3. Alice creates a room and shares the **invite code** with Bob
4. Alice sends a message — show padlock icons and ciphertext in MongoDB / DevTools
5. Bob receives and decrypts the message locally
6. Compare key fingerprints in **Encryption & keys**

---

## Related documentation

| Document | Description |
|----------|-------------|
| [TECH-STACK.md](TECH-STACK.md) | Technology stack and architecture |
| [WHY-TECH-CHOICES.md](WHY-TECH-CHOICES.md) | Rationale for stack decisions |
| [FOLDER-STRUCTURE.md](FOLDER-STRUCTURE.md) | Repository layout |
| [SECURITY-PLAN.md](SECURITY-PLAN.md) | Trust model and security controls |
| [REPO-SECURITY.md](REPO-SECURITY.md) | GitHub access control and branch protection |
| [DEPLOYMENT-OPTIONS.md](DEPLOYMENT-OPTIONS.md) | Local Docker vs AWS deployment |
