# StudySafe — Penetration & Security Testing Notes

**Module:** B9IS103  
**Date:** 19 July 2026  
**Tester:** Sudheer (lead) — team reviewed  
**Environment:** Local (FastAPI + MongoDB + React)

---

## Scope

Manual security testing of StudySafe Phase 1 production skeleton before final submission.

---

## Test results summary

| # | Test | Method | Expected | Result | Severity |
|---|------|--------|----------|--------|----------|
| 1 | OTP brute force | 10 rapid verify attempts with wrong code | Blocked after 5 attempts / rate limit | **PASS** | High |
| 2 | Unauthenticated API access | `GET /api/rooms/mine` without JWT | 401 Unauthorized | **PASS** | High |
| 3 | WebSocket without token | Connect to `/ws/room` without `?token=` | Connection rejected (4001) | **PASS** | High |
| 4 | Non-member room access | JWT user tries room they didn't join | 403 / not member | **PASS** | High |
| 5 | Honeypot probe | `GET /api/admin/users` | Decoy JSON + server log warning | **PASS** | Medium |
| 6 | Ciphertext on wire | DevTools → WebSocket frame | Base64 ciphertext, no plaintext | **PASS** | Critical |
| 7 | MongoDB content | Inspect `messages` collection | `ciphertext_payload` only | **PASS** | Critical |
| 8 | Invalid email OTP request | `POST /otp/request` with bad email | 422 validation error | **PASS** | Low |
| 9 | Oversized WebSocket payload | Send >64 KB message | Error / rejected | **PASS** | Medium |
| 10 | Security headers | `curl -I http://localhost:8000/health` | X-Frame-Options, X-Content-Type-Options | **PASS** | Medium |
| 11 | JWT expiry | Use expired token on API | 401 Unauthorized | **PASS** | High |
| 12 | XSS in message field | Send `<script>alert(1)</script>` | Rendered as text (React escapes) | **PASS** | Medium |

**Overall:** 12/12 passed on local environment.

---

## Detailed notes

### 1. OTP brute force (PASS)
- Attempted 10 wrong codes for same email
- After 5 failures, verification returns 401
- Rate limiter returns 429 on excessive OTP requests

### 2. E2E encryption verification (PASS)
- Sent message: `"Secret assignment password"`
- WebSocket payload contained only encrypted JSON with base64 ciphertext
- MongoDB `messages.ciphertext_payload` — same encrypted blob, no plaintext

### 3. Honeypot (PASS)
- Request: `GET /api/admin/users`
- Response: fake admin user list (decoy)
- Backend log: `HONEYPOT triggered: GET /api/admin/users from ip=...`

### 4. Authorization (PASS)
- User A creates room; User B (different JWT) cannot list keys without joining via invite code

---

## Known limitations (documented, not failures)

| Limitation | Risk | Mitigation planned |
|------------|------|-------------------|
| JWT in localStorage | XSS could steal token | HttpOnly cookies (Phase 2) |
| OTP logged in dev console | Dev only — not production | AWS SES in production |
| AWS not deployed yet | Local demo only | EC2 + ALB documented in `deploy/README.md` |
| No CSP header yet | XSS surface | Content-Security-Policy (Phase 2) |

---

## Automated test coverage

| Suite | Location | Count |
|-------|----------|-------|
| Backend pytest | `backend/tests/` | 10 tests |
| Frontend vitest | `frontend/src/lib/crypto.test.ts` | 1 test |
| CI | `.github/workflows/ci.yml` | Runs on every push |

Run locally:
```bash
cd backend && JWT_SECRET=test-secret-key-for-ci-only-32chars MONGODB_URI=mongodb://localhost:27017 pytest -v
cd frontend && npm test
```

---

## Conclusion

StudySafe meets the security requirements for Phase 1 submission. The server never stores or transmits plaintext messages. Authentication, authorization, rate limiting, and honeypot controls function as designed in local testing.

**Signed off for submission:** Team review 19 July 2026
