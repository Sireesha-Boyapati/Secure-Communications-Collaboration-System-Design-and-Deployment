# StudySafe — Peer Penetration Test Scope

**Purpose:** Define what external peer groups may test, how to report findings, and what is out of scope.  
**Live target:** https://studysafe.duckdns.org  
**Repository:** https://github.com/Sireesha-Boyapati/Secure-Communications-Collaboration-System-Design-and-Deployment

---

## What you are testing

StudySafe is an end-to-end encrypted realtime chat relay. The design goal is that **compromise of the server or database must not reveal message plaintext**.

Your job is to find ways to:

- Read message content without a legitimate user's browser session
- Bypass authentication or room membership checks
- Substitute or impersonate encryption keys (MITM)
- Abuse APIs or WebSockets (DoS, injection, privilege escalation)
- Extract secrets from the repository or running instance

Using automated tools, manual testing, or AI-assisted analysis (e.g. Claude, ChatGPT) is **allowed** — document your methodology in your report.

---

## In scope

| Area | Examples |
|------|----------|
| **Authentication** | OTP brute force, JWT tampering, session fixation, expired token reuse |
| **Authorization** | Access rooms/messages/keys without membership; horizontal privilege escalation |
| **WebSocket** | Connect without JWT; send oversized frames; inject into relay logic |
| **Cryptography** | Fake public keys; epoch confusion; decrypt ciphertext without private key |
| **Trust UI** | Bypass "verify before send"; stale trust after key rotation |
| **API abuse** | Rate limit bypass; honeypot probing; mass enumeration |
| **Infrastructure** | Misconfigured nginx/TLS; exposed `.env`; MongoDB exposure |
| **Client** | XSS stealing JWT from localStorage; trust store manipulation |
| **Source review** | Static analysis of `backend/` and `frontend/src/lib/crypto.ts` |

---

## Out of scope

| Item | Reason |
|------|--------|
| Denial-of-service against AWS/shared infrastructure | Could affect other students; use local clone for load tests |
| Social engineering of team members | Not application security |
| Gmail / MongoDB Atlas vendor attacks | Third-party services |
| Physical access to team laptops | Out of project boundary |
| Reporting "JWT in localStorage" alone without exploit chain | Known documented limitation |

---

## Rules of engagement

1. **Use your own test accounts** — register with emails you control; do not use real personal data of the StudySafe team.
2. **No destructive actions** — do not delete production data, wipe MongoDB, or modify other users' rooms.
3. **Local testing encouraged** — clone the repo and run locally for aggressive fuzzing or DoS experiments.
4. **Document reproduction steps** — include HTTP requests, screenshots, and commit hash tested.
5. **Responsible disclosure** — send findings to the StudySafe team before public posting; allow reasonable fix time.

---

## Suggested test plan

### Phase 1 — Reconnaissance (30 min)

- Read [README.md](../README.md) and [SECURITY-PLAN.md](SECURITY-PLAN.md)
- Browse OpenAPI: `https://studysafe.duckdns.org/docs`
- Probe honeypot: `GET /api/admin/users` (expect decoy + log entry)
- Map WebSocket endpoint: `/ws/room/{room_id}?token=`

### Phase 2 — Auth & access (1 h)

- Request OTP for invalid emails; brute-force OTP (expect rate limit after ~5 failures)
- Call protected REST routes without JWT → expect 401
- Join room with wrong invite code → expect 403/404
- Connect WebSocket without token → expect close code 4001

### Phase 3 — Encryption & trust (1–2 h)

- Two browsers, two emails — create channel, join, **do not verify keys** — confirm send is blocked
- Verify keys — confirm messages decrypt only between verified peers
- Re-register different public key at same epoch — check server audit log for `KEY_CHANGE`
- Join without "Share chat history" — confirm epoch increments and old messages hidden
- Inspect MongoDB or DevTools — confirm ciphertext only on wire and in DB

### Phase 4 — Source-assisted review (1–2 h)

- Trace JWT validation: `backend/app/auth/dependencies.py`
- Trace room membership on WebSocket: `backend/app/main.py`
- Trace crypto epoch rotation: `backend/app/services/room_service.py`
- Trace client trust gate: `frontend/src/components/chat/ChatRoom.tsx`, `frontend/src/lib/trustStore.ts`

---

## Evidence checklist

For each finding, provide:

- **Title** and **severity** (Critical / High / Medium / Low / Informational)
- **Steps to reproduce**
- **Expected vs actual behaviour**
- **Impact** (what an attacker gains)
- **Suggested fix** (optional)

---

## Known limitations (not bugs if unexploited)

| Limitation | Notes |
|------------|-------|
| JWT in sessionStorage (WebSocket fallback) | HttpOnly cookie used for REST; XSS in same tab could still read sessionStorage |
| Server cannot cryptographically prove public keys are honest | Mitigated by client fingerprint verification + epoch rotation + username binding |
| Self-signed TLS on demo EC2 | Browser warning only; use Let's Encrypt for production |
| OTP visible in dev console | Production uses Gmail SMTP; OTP never logged in production |

---

## Reporting

Submit findings to the StudySafe team (via course channel or agreed contact) with:

1. Summary table of issues
2. Detailed write-up per finding
3. Test environment (local vs EC2) and git commit hash

Internal baseline results: [PENETRATION-TEST.md](PENETRATION-TEST.md)
