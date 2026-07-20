# AI Session 6 — Client-side encryption (Web Crypto)

**Tool:** Cursor AI  
**Date:** July 2026  
**Stage:** Frontend crypto — ECDH, AES-GCM, fingerprints

---

## Prompt we gave AI

```
Implement REAL client-side E2E encryption for StudySafe using Web Crypto API only.
No dummy base64 obfuscation. No server-side message crypto.

Requirements from CA brief:
- Two users who never met must agree keys without pre-sharing secrets
- ECDH P-256 key agreement
- AES-256-GCM encrypt/decrypt
- SHA-256 fingerprint for out-of-band verification
- Private keys NEVER sent to server

Provide: frontend/src/lib/crypto.ts with generateKeyPair, encryptForRecipient, decryptFromSender.
Explain each step for our report.
```

---

## What AI implemented

**File:** `frontend/src/lib/crypto.ts`

| Function | Purpose |
|----------|---------|
| `generateKeyPair()` | ECDH P-256 in browser |
| `encryptForRecipient()` | Derive shared secret → AES-GCM encrypt |
| `decryptFromSender()` | Decrypt incoming ciphertext |
| Fingerprint | SHA-256 of public JWK (first 8 bytes hex) |

**Golden rule (AI + team enforced):**
> Plaintext must never reach backend or MongoDB.

**Demo proof for Paul:** DevTools → Network → WebSocket payload shows ciphertext JSON only.

---

## Why Web Crypto (AI recommendation we accepted)

- Browser-native — assignment says no security through obscurity
- Standard algorithms named in README
- No npm crypto supply-chain risk

---

## Evidence

- `frontend/src/lib/crypto.test.ts` (vitest)
- Phase 1 commit `d545c64` — frontend E2E demo
- Production `ChatRoom.tsx` encrypts before every send

---

## Team responsibility

We reviewed AI crypto code to ensure no custom ciphers; all operations use `crypto.subtle.*` only.
