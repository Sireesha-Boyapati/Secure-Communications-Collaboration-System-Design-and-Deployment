# AI Session 5 — Security, threat model, and attack tables

**Tool:** Cursor AI  
**Date:** July 2026  
**Stage:** Security — threat model, OTP, JWT, rate limits, honeypot

---

## Prompt we gave AI

```
For B9IS103 we need security documentation Paul expects:

1. Threat model (assets, threats, mitigations)
2. Attack scenario table with columns:
   Vulnerability | Who Can Attack | How | Impact | Prevention
3. Remediation strategies with implementation status
4. Working controls: rate limiting, JWT auth, honeypot, security headers

Implement security code AND write README sections 10-13.
Use email OTP identity model. Assume maliciously curious server.
```

---

## What AI produced

### Threat model (README §11)
- Asset: message plaintext → mitigation: E2E encryption
- Asset: JWT → mitigation: short TTL, future HttpOnly cookies
- Asset: OTP → mitigation: rate limit + 5 attempts + expiry

### Attack table (README §12) — 11 scenarios
Including: MITM key substitution, server breach, JWT theft, OTP brute force, WebSocket hijacking, NoSQL injection, DoS, honeypot reconnaissance.

### Code implemented (AI-assisted)
| Control | File |
|---------|------|
| Rate limiting | `backend/app/security/rate_limit.py` |
| Security headers | `backend/app/security/middleware.py` |
| Honeypot | `backend/app/security/honeypot.py` |
| JWT + room auth | `backend/app/auth/` |

### Identity (assignment requirement)
**Email OTP** — communications-channel identity  
**Key fingerprint** — out-of-band MITM detection

---

## Prompt → assessor check

Ask AI to “document attacks like SQL injection example in brief” → full table in README §12.  
Paul can open GitHub README without a separate Word report.

---

## Evidence

- `docs/SECURITY-PLAN.md`
- `docs/PENETRATION-TEST.md` (12 manual tests)
- Commit series: security middleware, honeypot, rate_limit
