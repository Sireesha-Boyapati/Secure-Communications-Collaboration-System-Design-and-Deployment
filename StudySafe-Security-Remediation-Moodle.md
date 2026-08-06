# StudySafe — Security Remediation Report

**Module:** B9IS103 — Secure Communications / Collaboration System Design and Deployment  
**Project:** StudySafe  
**Team:** Mahendra · Sireesha · Oree · Sudheer  
**Document type:** Remediation report after peer penetration testing (upload to Moodle)  
**Date:** August 2026

**Live application:** https://studysafe.duckdns.org  
**Repository:** https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment  
**Remediation commit:** `f16aacb` — fix(security): harden auth, CSP, replay protection, and OTP lockout

---

## 1. Introduction

After the final demo, **two peer groups** tested StudySafe as part of the module peer penetration exercise. They reviewed our live deployment (https://studysafe.duckdns.org), inspected the public GitHub repository, and reported security weaknesses using the scope defined in our project documentation.

This report documents:

- What peer testers found on **our** application  
- What we changed in the codebase to address those findings  
- How we verified the fixes before release  

We followed responsible disclosure: findings were received from peer groups, prioritised by severity, and fixed in a single security hardening commit without breaking the production AWS deployment.

---

## 2. Peer testing context

| Item | Detail |
|------|--------|
| **Peer groups** | Group 1 (SecureChat — Deekshith team) and Group 2 (Secure Communication System — KiranRiz team) |
| **Our scope document** | `docs/PEN-TEST-SCOPE.md` on GitHub |
| **Testing methods used by peers** | DevTools (Network, Application, WebSocket), curl, OpenAPI docs, static code review |
| **Rules** | Own test accounts only; no destructive actions on production |

Peer groups tested authentication, authorization, WebSocket access, client-side storage, security headers, and cryptography/trust behaviour — the same areas we tested on their systems.

---

## 3. Findings reported on StudySafe

The table below summarises issues raised by peer groups during review of StudySafe. Severity reflects impact if exploited, not whether our design already had partial mitigations.

| # | Finding | Severity | How peers identified it |
|---|---------|----------|-------------------------|
| 1 | JWT stored in **localStorage** — XSS could steal session token | High | DevTools → Application → Local Storage → `studysafe_token` |
| 2 | No **Content-Security-Policy** header on API or frontend | Medium | `curl -I` on `/health` and browser response headers |
| 3 | No **message replay protection** — same ciphertext could be resent | High | Resubmit captured WebSocket payload; no server-side deduplication |
| 4 | OTP lockout existed but gave **generic error** after 5 failures | Medium | Six rapid wrong OTP attempts — unclear if locked or wrong code |
| 5 | OTP **verify rate limit** too permissive (10/minute) | Medium | Rapid verify requests in testing |
| 6 | OTP codes could appear in **server logs** if email delivery failed | Medium | Code review of `email_service.py` |
| 7 | **Username spoofing** on public-key register — client could send arbitrary username | Medium | POST `/api/rooms/{id}/keys` with username ≠ display name |
| 8 | Trust fingerprints stored in **localStorage** (persistent) | Low–Medium | DevTools → Local Storage → `studysafe_trust_*` |
| 9 | Default **JWT secret** not blocked at startup in production | Medium | Review of `config.py` and `.env.example` |

**Already strong (peers confirmed PASS):** E2E ciphertext on wire, MongoDB stores ciphertext only, WebSocket requires auth, room membership enforced, trust-gated send blocked unverified messaging, OTP brute force limited to 5 attempts, rate limiting on OTP request, honeypot endpoint, crypto epoch rotation on join/leave.

---

## 4. Remediation implemented

All fixes below are in Git commit **`f16aacb`** (119 commits on `main`).

### 4.1 Finding 1 — JWT in localStorage

| Field | Detail |
|-------|--------|
| **Risk** | Cross-site scripting (XSS) could read JWT from persistent browser storage |
| **Fix** | (1) Moved token to **sessionStorage** (tab-scoped, cleared when tab closes). (2) Auto-migrate existing users from localStorage. (3) Set **HttpOnly session cookie** on OTP verify for REST API. (4) API calls use `credentials: include`. |
| **Files changed** | `frontend/src/api/client.ts`, `frontend/src/context/AuthContext.tsx`, `backend/app/auth/cookies.py`, `backend/app/routers/auth.py`, `backend/app/auth/dependencies.py` |
| **Backward compatible** | Yes — existing localStorage tokens migrate; WebSocket still supports `?token=` query param |

---

### 4.2 Finding 2 — Missing Content-Security-Policy

| Field | Detail |
|-------|--------|
| **Risk** | Larger XSS attack surface without CSP restricting script and connect sources |
| **Fix** | Added CSP, HSTS (production), X-Frame-Options, nosniff, and Referrer-Policy on API responses and nginx frontend |
| **Files changed** | `backend/app/security/headers.py`, `backend/app/security/middleware.py`, `frontend/nginx.prod.conf` |

---

### 4.3 Finding 3 — Message replay

| Field | Detail |
|-------|--------|
| **Risk** | Attacker could capture and resend encrypted WebSocket messages; server would store and relay again |
| **Fix** | Client adds unique **`msg_id`** (UUID) per message. Server stores seen IDs in MongoDB collection `message_replays` with TTL (10 minutes). Duplicate `msg_id` in same room returns error `replay_detected`. |
| **Files changed** | `frontend/src/components/chat/ChatRoom.tsx`, `frontend/src/types/index.ts`, `backend/app/db/repositories/replay.py`, `backend/app/services/message_service.py`, `backend/app/main.py` |
| **Note** | Same approach peer Group 2 lacked (in-memory ReplayGuard only) — our fix uses persistent MongoDB |

---

### 4.4 Findings 4 & 5 — OTP lockout and rate limits

| Field | Detail |
|-------|--------|
| **Risk** | Unclear lockout messaging; verify endpoint allowed 10 attempts per minute |
| **Fix** | After 5 failed attempts, API returns **`otp_locked`** with message to request a new code. Verify endpoint rate limit reduced to **5/minute** (aligned with attempt cap). |
| **Files changed** | `backend/app/db/repositories/otp.py`, `backend/app/services/auth_service.py`, `backend/app/routers/auth.py` |

---

### 4.5 Finding 6 — OTP in production logs

| Field | Detail |
|-------|--------|
| **Risk** | If SMTP failed on EC2, OTP could be written to Docker logs |
| **Fix** | OTP codes logged **only in development** when email is not configured. Production raises error without logging the code. |
| **Files changed** | `backend/app/services/email_service.py` |

---

### 4.6 Finding 7 — Public-key username spoofing

| Field | Detail |
|-------|--------|
| **Risk** | User could register a public key under a fake display name, confusing trust verification |
| **Fix** | Server validates `username` in key registration matches the authenticated user’s **display_name**. Returns `422 username_mismatch` if not. |
| **Files changed** | `backend/app/services/room_service.py` |

---

### 4.7 Finding 8 — Trust store in localStorage

| Field | Detail |
|-------|--------|
| **Risk** | Verified fingerprint state persisted across browser sessions; easier to tamper or inspect |
| **Fix** | Moved trust records to **sessionStorage** with migration from localStorage. Cleared on room leave and key rotation (existing behaviour). |
| **Files changed** | `frontend/src/lib/trustStore.ts` |

---

### 4.8 Finding 9 — Default JWT secret in production

| Field | Detail |
|-------|--------|
| **Risk** | Misconfigured production could run with default `change-me-use-openssl-rand-hex-32` |
| **Fix** | Application **refuses to start** in production if JWT secret is still the default value |
| **Files changed** | `backend/app/main.py` |

---

### 4.9 Additional hardening

| Change | Purpose |
|--------|---------|
| `POST /api/auth/logout` | Clears HttpOnly session cookie |
| `backend/tests/test_security.py` | Automated tests for CSP, OTP lockout, replay, username binding |
| Updated `docs/PENETRATION-TEST.md` | 19/19 manual tests including new controls |

---

## 5. Verification

### 5.1 Automated tests

| Suite | Result |
|-------|--------|
| Backend pytest (18 tests) | **PASS** — includes 4 new security tests |
| Frontend vitest (2 tests) | **PASS** |
| GitHub Actions CI | Runs on every push to `main` |

### 5.2 Manual re-test summary (post-fix)

| # | Test | Result |
|---|------|--------|
| 16 | Content-Security-Policy header present | **PASS** |
| 17 | Duplicate `msg_id` rejected over WebSocket | **PASS** |
| 18 | OTP lockout returns `otp_locked` | **PASS** |
| 19 | Wrong username on key register → `username_mismatch` | **PASS** |

All prior tests (OTP brute force, auth, WebSocket, E2E ciphertext, trust gate, epoch rotation) remain **PASS**.

---

## 6. Deployment status

| Environment | Status |
|-------------|--------|
| **GitHub `main`** | Remediation merged — commit `f16aacb` |
| **AWS EC2 (studysafe.duckdns.org)** | Requires `git pull` and `docker compose -f docker-compose.prod.yml up -d --build` when team is ready |
| **Production `.env`** | No change required if `JWT_SECRET` already set on EC2 |

After deploy, users may need to **log in once** (token storage migration). Chat and encryption behaviour is unchanged.

---

## 7. Remaining known limitations

| Limitation | Mitigation |
|------------|------------|
| JWT in sessionStorage for WebSocket fallback | HttpOnly cookie for REST; CSP; tab-scoped storage |
| Private JWK in sessionStorage during active chat | Cleared on epoch rotation; not in localStorage |
| Server cannot prove public keys are honest | Trust UI + mandatory verify before send + username binding |
| Self-signed TLS on demo EC2 | Let's Encrypt recommended for production |

These are documented in `docs/PEN-TEST-SCOPE.md` and are acceptable for the assignment scope when no exploit chain is demonstrated.

---

## 8. Conclusion

Peer groups identified realistic weaknesses in StudySafe — mainly around **browser storage**, **security headers**, **replay protection**, and **OTP/logging hardening**. We addressed each finding in commit **`f16aacb`** with backward-compatible changes that preserve end-to-end encryption and do not require EC2 configuration changes.

StudySafe continues to enforce: **plaintext never stored on server**, **membership-checked WebSocket relay**, **trust-gated messaging**, and **crypto epoch rotation** on membership changes. The remediation closes the gaps peers reported and aligns our controls with the same standards we applied when reviewing peer systems.

---

**Team sign-off**

| Name | Role |
|------|------|
| Mahendra | Backend / security fixes |
| Sireesha | Frontend / client storage migration |
| Oree | Auth / AWS deployment |
| Sudheer | Pen-test documentation |
